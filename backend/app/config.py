from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    
    
    SMTP_EMAIL: str
    SMTP_PASSWORD: str
    SMTP_SERVER: str = "smtp.gmail.com" 
    SMTP_PORT: int = 587          

    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7

    class Config:
        env_file = ".env"

settings = Settings()