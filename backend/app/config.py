from pydantic_settings import BaseSettings

class Settings(BaseSettings):

    # SMTP Settings for Gmail
    SMTP_EMAIL: str = "ghaliasaleh23@gmail.com"
    SMTP_PASSWORD: str = "rbjz vubu dtsp nztu"
    SMTP_SERVER: str = "smtp.gmail.com"
    SMTP_PORT: int = 587


    # This should be a very long and random string.
    # It can be generated using: openssl rand -hex 32
    SECRET_KEY: str = "09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    class Config:
        env_file = ".env"

settings = Settings()