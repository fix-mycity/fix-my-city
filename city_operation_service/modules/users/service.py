from sqlalchemy import func
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
import hashlib
import logging
import httpx

from config import settings
from .model import Profile, SavedLocation, AadhaarVerification
from .schema import ProfileUpdateSchema, SavedLocationCreateSchema, SavedLocationUpdateSchema

logger = logging.getLogger(__name__)



def get_or_create_profile(db: Session, user_id: int) -> Profile:
    """
    Fetch the profile for this user. If it doesn't exist yet
    (e.g. user registered via auth_service but never opened
    their profile page here), create an empty one on the fly.
    """
    profile = db.query(Profile).filter(Profile.user_id == user_id).first()

    if profile is None:
        try:
            profile = Profile(user_id=user_id)
            db.add(profile)
            db.commit()
            db.refresh(profile)
        except IntegrityError:
            db.rollback()
            # If created concurrently by another request, fetch the existing one
            profile = db.query(Profile).filter(Profile.user_id == user_id).first()

    return profile


def update_profile(db: Session, user_id: int, data: ProfileUpdateSchema) -> Profile:
    profile = get_or_create_profile(db, user_id)

    # only update fields that were actually sent (exclude_unset=True)
    update_data = data.model_dump(exclude_unset=True)

    # whitelist of allowed fields to prevent mass assignment
    allowed_fields = {"full_name", "phone_number", "avatar_url", "bio"}

    for field, value in update_data.items():
        if field in allowed_fields:
            setattr(profile, field, value)

    db.commit()
    db.refresh(profile)

    return profile


def create_saved_location(db: Session, user_id: int, data: SavedLocationCreateSchema) -> SavedLocation:
    # check for duplicate label for this user (case-insensitive)
    existing = db.query(SavedLocation).filter(
        SavedLocation.user_id == user_id,
        func.lower(SavedLocation.label) == data.label.lower()
    ).first()
    if existing:
        raise ValueError("A location with this label already exists")

    location = SavedLocation(
        user_id=user_id,
        label=data.label,
        address=data.address,
        latitude=data.latitude,
        longitude=data.longitude
    )
    db.add(location)
    db.commit()
    db.refresh(location)
    return location


def get_saved_locations(db: Session, user_id: int) -> list[SavedLocation]:
    return db.query(SavedLocation).filter(SavedLocation.user_id == user_id).all()


def update_saved_location(
    db: Session,
    user_id: int,
    location_id: int,
    data: SavedLocationUpdateSchema
) -> SavedLocation | None:
    location = db.query(SavedLocation).filter(
        SavedLocation.id == location_id,
        SavedLocation.user_id == user_id
    ).first()

    if not location:
        return None

    # check for duplicate label if updating the label
    if data.label is not None:
        existing = db.query(SavedLocation).filter(
            SavedLocation.user_id == user_id,
            SavedLocation.id != location_id,
            func.lower(SavedLocation.label) == data.label.lower()
        ).first()
        if existing:
            raise ValueError("A location with this label already exists")

    # check coordinate co-dependence on resulting values
    update_data = data.model_dump(exclude_unset=True)
    new_lat = update_data["latitude"] if "latitude" in update_data else location.latitude
    new_lon = update_data["longitude"] if "longitude" in update_data else location.longitude
    if (new_lat is None) != (new_lon is None):
        raise ValueError("Both latitude and longitude must be provided together, or both must be null")

    # whitelist of allowed fields to prevent mass assignment
    allowed_fields = {"label", "address", "latitude", "longitude"}

    for field, value in update_data.items():
        if field in allowed_fields:
            setattr(location, field, value)

    db.commit()
    db.refresh(location)

    return location


def delete_saved_location(db: Session, user_id: int, location_id: int) -> bool:
    location = db.query(SavedLocation).filter(
        SavedLocation.id == location_id,
        SavedLocation.user_id == user_id
    ).first()

    if not location:
        return False

    db.delete(location)
    db.commit()
    return True


def update_avatar_url(db: Session, user_id: int, avatar_url: str) -> Profile:
    profile = get_or_create_profile(db, user_id)
    profile.avatar_url = avatar_url
    db.commit()
    db.refresh(profile)
    return profile


def hash_aadhaar(aadhaar_number: str) -> str:
    return hashlib.sha256(aadhaar_number.encode("utf-8")).hexdigest()


async def generate_aadhaar_otp_service(db: Session, user_id: int, aadhaar_number: str) -> dict:
    """
    Generate Aadhaar OTP using Cashfree Secure ID.
    Checks if the user profile is already verified and checks for duplicate Aadhaar numbers across other accounts.
    """
    logger.info(f"Initiating Aadhaar OTP generation for user {user_id}")

    # Check if the user is already verified
    profile = get_or_create_profile(db, user_id)
    if profile.is_aadhaar_verified:
        logger.warning(f"User {user_id} is already Aadhaar verified.")
        raise ValueError("Your profile is already Aadhaar verified.")

    # Check for duplicate Aadhaar numbers across other users (using SHA-256 hash)
    aadhaar_hash = hash_aadhaar(aadhaar_number)
    existing_verified = db.query(AadhaarVerification).filter(
        AadhaarVerification.aadhaar_number_hash == aadhaar_hash,
        AadhaarVerification.status == "SUCCESS"
    ).first()

    if existing_verified:
        logger.warning(f"Aadhaar hash collision: Aadhaar is already verified by user {existing_verified.user_id}.")
        raise ValueError("This Aadhaar number is already verified by another account.")

    # Cashfree integration
    url = f"{settings.CASHFREE_BASE_URL.rstrip('/')}/offline-aadhaar/otp"
    payload = {"aadhaar_number": aadhaar_number}
    headers = {
        "x-client-id": settings.CASHFREE_CLIENT_ID,
        "x-client-secret": settings.CASHFREE_CLIENT_SECRET,
        "x-api-version": settings.CASHFREE_API_VERSION,
        "Content-Type": "application/json"
    }

    logger.info(f"Calling Cashfree OTP generation API: {url}")
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(url, json=payload, headers=headers, timeout=15.0)
        except httpx.RequestError as exc:
            logger.error(f"HTTP request error during Aadhaar OTP generation: {exc}")
            raise ValueError(f"Could not connect to Cashfree verification service: {str(exc)}")

    if response.status_code != 200:
        logger.error(f"Cashfree OTP generation failed with status code {response.status_code}: {response.text}")
        try:
            err_data = response.json()
            error_message = err_data.get("message") or err_data.get("description") or "Failed to generate Aadhaar OTP."
        except Exception:
            error_message = f"Cashfree API error (HTTP {response.status_code})"
        raise ValueError(error_message)

    res_data = response.json()
    status_str = res_data.get("status")

    if status_str in ("FAILED", "ERROR"):
        error_message = res_data.get("message", "Aadhaar OTP generation failed.")
        logger.error(f"Cashfree API returned logical failure: {error_message}")
        raise ValueError(error_message)

    ref_id = res_data.get("ref_id")
    if not ref_id:
        logger.error(f"Cashfree API did not return ref_id in response: {res_data}")
        raise ValueError("Invalid response from Cashfree service: Missing reference ID.")

    # Save pending verification record in DB
    verification = AadhaarVerification(
        user_id=user_id,
        ref_id=ref_id,
        aadhaar_number_hash=aadhaar_hash,
        status="PENDING"
    )
    db.add(verification)
    db.commit()
    db.refresh(verification)

    logger.info(f"Successfully generated Aadhaar OTP. ref_id: {ref_id} for user {user_id}")
    return {
        "ref_id": ref_id,
        "status": status_str or "SUCCESS",
        "message": res_data.get("message") or "OTP generated successfully."
    }


async def verify_aadhaar_otp_service(db: Session, user_id: int, ref_id: str, otp: str) -> dict:
    """
    Verify Aadhaar OTP with Cashfree Secure ID.
    Updates the user profile to marked as verified if successful.
    """
    logger.info(f"Initiating Aadhaar OTP verification for user {user_id}, ref_id: {ref_id}")

    # Check database for existing pending verification
    verification = db.query(AadhaarVerification).filter(
        AadhaarVerification.ref_id == ref_id,
        AadhaarVerification.user_id == user_id
    ).first()

    if not verification:
        logger.warning(f"Verification request not found for ref_id: {ref_id}, user_id: {user_id}")
        raise ValueError("Aadhaar verification request not found.")

    if verification.status == "SUCCESS":
        logger.info(f"Verification is already successful for ref_id: {ref_id}")
        # Fetch profile and return
        profile = get_or_create_profile(db, user_id)
        return {
            "status": "VALID",
            "message": "Aadhaar already verified successfully.",
            "ref_id": ref_id,
            "data": {
                "name": profile.aadhaar_name
            }
        }

    # Cashfree integration
    url = f"{settings.CASHFREE_BASE_URL.rstrip('/')}/offline-aadhaar/verify"
    payload = {
        "otp": otp,
        "ref_id": ref_id
    }
    headers = {
        "x-client-id": settings.CASHFREE_CLIENT_ID,
        "x-client-secret": settings.CASHFREE_CLIENT_SECRET,
        "x-api-version": settings.CASHFREE_API_VERSION,
        "Content-Type": "application/json"
    }

    logger.info(f"Calling Cashfree OTP verification API: {url}")
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(url, json=payload, headers=headers, timeout=15.0)
        except httpx.RequestError as exc:
            logger.error(f"HTTP request error during Aadhaar OTP verification: {exc}")
            raise ValueError(f"Could not connect to Cashfree verification service: {str(exc)}")

    if response.status_code != 200:
        logger.error(f"Cashfree OTP verification failed with status code {response.status_code}: {response.text}")
        try:
            err_data = response.json()
            error_message = err_data.get("message") or err_data.get("description") or "Failed to verify Aadhaar OTP."
        except Exception:
            error_message = f"Cashfree API error (HTTP {response.status_code})"
        
        # Update verification attempt status
        verification.status = "FAILED"
        verification.error_message = error_message
        db.commit()
        raise ValueError(error_message)

    res_data = response.json()
    status_str = res_data.get("status")

    if status_str not in ("VALID", "SUCCESS"):
        error_message = res_data.get("message") or f"Aadhaar verification failed with status: {status_str}"
        logger.error(f"Cashfree verification failed logically: {error_message}")
        
        # Update verification attempt status
        verification.status = "FAILED"
        verification.error_message = error_message
        db.commit()
        raise ValueError(error_message)

    # Success! Extract details and update profile
    details = res_data.get("data") or {}
    aadhaar_name = details.get("name") or "Aadhaar Verified User"

    verification.status = "SUCCESS"
    verification.error_message = None
    
    # Update profile table
    profile = get_or_create_profile(db, user_id)
    profile.is_aadhaar_verified = True
    profile.aadhaar_name = aadhaar_name
    if not profile.full_name:
        profile.full_name = aadhaar_name

    db.commit()
    logger.info(f"Successfully verified Aadhaar for user {user_id}. Name: {aadhaar_name}")

    return res_data


async def init_digilocker_service(db: Session, user_id: int, redirect_url: str) -> dict:
    import time
    profile = get_or_create_profile(db, user_id)
    if profile.is_aadhaar_verified:
        logger.warning(f"User {user_id} is already Aadhaar verified.")
        raise ValueError("Your profile is already Aadhaar verified.")

    verification_id = f"dl_verify_{user_id}_{int(time.time())}"
    
    if not settings.CASHFREE_CLIENT_ID or not settings.CASHFREE_CLIENT_SECRET or settings.CASHFREE_CLIENT_ID == "YOUR_CLIENT_ID":
        logger.error("Cashfree API credentials are not configured in environment variables.")
        raise ValueError("Cashfree API credentials (CASHFREE_CLIENT_ID / CASHFREE_CLIENT_SECRET) are missing or not configured in environment variables.")

    # Cashfree integration
    url = f"{(settings.CASHFREE_BASE_URL or 'https://sandbox.cashfree.com/verification').rstrip('/')}/digilocker"
    payload = {
        "verification_id": verification_id,
        "redirect_url": redirect_url,
        "document_requested": ["AADHAAR"]
    }
    headers = {
        "x-client-id": str(settings.CASHFREE_CLIENT_ID),
        "x-client-secret": str(settings.CASHFREE_CLIENT_SECRET),
        "x-api-version": str(settings.CASHFREE_API_VERSION or "2022-10-26"),
        "Content-Type": "application/json"
    }

    logger.info(f"Calling Cashfree DigiLocker Init API: {url} with verification_id: {verification_id}")
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(url, json=payload, headers=headers, timeout=15.0)
        except httpx.RequestError as exc:
            logger.error(f"HTTP request error during DigiLocker init: {exc}")
            raise ValueError(f"Could not connect to Cashfree verification service: {str(exc)}")

    if response.status_code != 200:
        logger.error(f"Cashfree DigiLocker init failed with status code {response.status_code}: {response.text}")
        try:
            err_data = response.json()
            error_message = err_data.get("message") or err_data.get("description") or "Failed to initiate DigiLocker verification."
        except Exception:
            error_message = f"Cashfree API error (HTTP {response.status_code})"
        raise ValueError(error_message)

    res_data = response.json()
    status_str = res_data.get("status")

    if status_str == "FAILED":
        error_message = res_data.get("message", "DigiLocker initiation failed.")
        logger.error(f"Cashfree API returned logical failure: {error_message}")
        raise ValueError(error_message)

    ref_id = res_data.get("reference_id")
    if not ref_id:
        logger.error(f"Cashfree API did not return reference_id in response: {res_data}")
        raise ValueError("Invalid response from Cashfree service: Missing reference ID.")

    # Save pending verification record in DB (using unique verification_id as ref_id)
    verification = AadhaarVerification(
        user_id=user_id,
        ref_id=verification_id,
        status="PENDING"
    )
    db.add(verification)
    db.commit()
    db.refresh(verification)

    logger.info(f"Successfully generated DigiLocker URL. verification_id: {verification_id} for user {user_id}")
    return {
        "verification_id": verification_id,
        "reference_id": ref_id,
        "url": res_data.get("url"),
        "status": status_str or "PENDING",
        "redirect_url": redirect_url
    }


async def check_digilocker_status_service(db: Session, user_id: int, verification_id: str) -> dict:
    logger.info(f"Initiating DigiLocker status verification for user {user_id}, verification_id: {verification_id}")

    # Check database for existing verification
    verification = db.query(AadhaarVerification).filter(
        AadhaarVerification.ref_id == verification_id,
        AadhaarVerification.user_id == user_id
    ).first()

    if not verification:
        logger.warning(f"Verification request not found for verification_id: {verification_id}, user_id: {user_id}")
        raise ValueError("Aadhaar verification request not found.")

    profile = get_or_create_profile(db, user_id)

    if verification.status == "SUCCESS":
        logger.info(f"Verification is already successful for verification_id: {verification_id}")
        return {
            "status": "SUCCESS",
            "verification_id": verification_id,
            "reference_id": 0,
            "name": profile.aadhaar_name,
            "message": "Aadhaar already verified successfully."
        }

    # Call Cashfree status API
    url = f"{settings.CASHFREE_BASE_URL.rstrip('/')}/digilocker"
    params = {"verification_id": verification_id}
    headers = {
        "x-client-id": settings.CASHFREE_CLIENT_ID,
        "x-client-secret": settings.CASHFREE_CLIENT_SECRET,
        "x-api-version": settings.CASHFREE_API_VERSION
    }

    logger.info(f"Calling Cashfree DigiLocker Status API: {url} with verification_id: {verification_id}")
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(url, params=params, headers=headers, timeout=15.0)
        except httpx.RequestError as exc:
            logger.error(f"HTTP request error during DigiLocker status check: {exc}")
            raise ValueError(f"Could not connect to Cashfree verification service: {str(exc)}")

    if response.status_code != 200:
        logger.error(f"Cashfree DigiLocker status check failed with status code {response.status_code}: {response.text}")
        try:
            err_data = response.json()
            error_message = err_data.get("message") or err_data.get("description") or "Failed to check DigiLocker status."
        except Exception:
            error_message = f"Cashfree API error (HTTP {response.status_code})"
        
        verification.status = "FAILED"
        verification.error_message = error_message
        db.commit()
        raise ValueError(error_message)

    res_data = response.json()
    status_str = res_data.get("status")
    reference_id = res_data.get("reference_id", 0)

    # In Cashfree, standard success status for DigiLocker consent is "SUCCESS" or "AUTHENTICATED"
    if status_str in ("SUCCESS", "AUTHENTICATED"):
        # Fetch the Aadhaar document details to extract the name
        doc_url = f"{settings.CASHFREE_BASE_URL.rstrip('/')}/digilocker/document/AADHAAR"
        logger.info(f"Calling Cashfree DigiLocker Document Fetch API: {doc_url}")
        async with httpx.AsyncClient() as client:
            try:
                doc_response = await client.get(doc_url, params=params, headers=headers, timeout=15.0)
            except httpx.RequestError as exc:
                logger.error(f"HTTP request error during DigiLocker document fetch: {exc}")
                raise ValueError(f"Could not connect to Cashfree verification service: {str(exc)}")

        if doc_response.status_code != 200:
            logger.error(f"Cashfree DigiLocker document fetch failed with status code {doc_response.status_code}: {doc_response.text}")
            error_message = "Failed to fetch Aadhaar document details from DigiLocker."
            verification.status = "FAILED"
            verification.error_message = error_message
            db.commit()
            raise ValueError(error_message)

        doc_data = doc_response.json()
        
        # Sandbox response returns validation_pending if the simulation is in process
        if doc_data.get("code") == "validation_pending":
             return {
                 "status": "PENDING",
                 "verification_id": verification_id,
                 "reference_id": reference_id,
                 "message": "Verification is in progress. Please check back shortly."
             }
             
        # Success! Extract details and update profile
        aadhaar_name = doc_data.get("name") or doc_data.get("user_details", {}).get("name") or "Aadhaar Verified User"

        # Update verification log
        verification.status = "SUCCESS"
        verification.error_message = None
        
        # Update profile table
        profile.is_aadhaar_verified = True
        profile.aadhaar_name = aadhaar_name
        if not profile.full_name:
            profile.full_name = aadhaar_name

        db.commit()
        logger.info(f"Successfully verified Aadhaar via DigiLocker for user {user_id}. Name: {aadhaar_name}")

        return {
            "status": "SUCCESS",
            "verification_id": verification_id,
            "reference_id": reference_id,
            "name": aadhaar_name,
            "message": "Aadhaar verified successfully."
        }

    elif status_str in ("FAILED", "EXPIRED"):
        error_message = res_data.get("message") or f"Aadhaar verification failed with status: {status_str}"
        logger.error(f"Cashfree DigiLocker verification failed logically: {error_message}")
        
        verification.status = "FAILED"
        verification.error_message = error_message
        db.commit()
        return {
            "status": "FAILED",
            "verification_id": verification_id,
            "reference_id": reference_id,
            "message": error_message
        }

    # Otherwise it is still PENDING
    return {
        "status": "PENDING",
        "verification_id": verification_id,
        "reference_id": reference_id,
        "message": "User consent flow is pending."
    }

