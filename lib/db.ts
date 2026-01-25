import { neon } from "@neondatabase/serverless"

export const sql = neon(process.env.DATABASE_URL!)

// Helper to check if error is rate limit
export function isRateLimitError(error: unknown): boolean {
  if (error instanceof Error) {
    return error.message.includes("Too Many") || error.message.includes("rate limit") || error.message.includes("429")
  }
  return false
}

// Helper to create appropriate error response
export function handleDbError(error: unknown, context: string) {
  console.error(`${context} error:`, error)
  
  if (isRateLimitError(error)) {
    return Response.json(
      { error: "יותר מדי בקשות, אנא המתן מספר שניות ונסה שוב" },
      { status: 429 }
    )
  }
  
  return Response.json(
    { error: "שגיאה בשרת" },
    { status: 500 }
  )
}
