from pydantic import BaseModel


class RoleSchema(BaseModel):

    role_name: str

    description: str | None = None