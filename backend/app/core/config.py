from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Portfolio Simulator API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # We will add Supabase credentials here in a later phase
    
    class Config:
        env_file = ".env"

settings = Settings()