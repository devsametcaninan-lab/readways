type PgErrorLike = {
  code?: string | null;
};

export function isUniqueViolation(error: PgErrorLike | null | undefined): boolean {
  return error?.code === "23505";
}
