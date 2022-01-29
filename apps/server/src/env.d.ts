declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DATABASE_URL: string;
      ACCESS_TOKEN_SECET: string;
      REFRESH_TOKEN_SECET: string;
    }
  }
}

export {}
