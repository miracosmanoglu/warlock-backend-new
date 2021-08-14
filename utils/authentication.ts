import jwt from "jsonwebtoken";
const SECRET = "asbadbbdbbh7788888887hb113h3hbb";

export async function getUserId(req: any) {
  const token = req.headers.authorization;

  if (typeof token !== "undefined") {
    try {
      const user = await jwt.verify(token, SECRET);
      return { user };
    } catch (error: unknown) {
      return { message: (error as Error).message };
    }
  } else {
    return null;
  }
}
