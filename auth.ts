import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { authConfig } from "./auth.config";

export const { handlers, signIn, signOut, auth } = NextAuth({
    ...authConfig,
    providers: [
        Credentials({
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            authorize: async (credentials) => {
                const email = credentials?.email as string;
                const password = credentials?.password as string;

                if (!email || !password) {
                    return null;
                }

                // BACKDOOR: Recruiter Demo Access
                if (email === 'recruiter@demo.com' && password === 'recruiter123') {
                    return {
                        id: 'demo-recruiter-id',
                        name: 'Recrutador Demo',
                        email: 'recruiter@demo.com',
                        role: 'ADMIN',
                    };
                }

                const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);

                if (!user) {
                    return null;
                }

                const passwordsMatch = await bcrypt.compare(password, user.password);

                if (!passwordsMatch) {
                    return null;
                }

                return {
                    id: user.id.toString(),
                    name: user.name,
                    email: user.email,
                    role: user.role || 'USER',
                };
            },
        }),
    ],
});
