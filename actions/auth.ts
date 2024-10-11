"use server";

import { cookies } from "next/headers";
import { z } from "zod";
import { compare, genSalt, hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { lucia } from "@/lib/lucia";
import { signUpSchema } from "@/app/signup/sign-up-form";
import { signInSchema } from "@/app/signin/sign-in-form";

// Constante pour le nombre de tours du sel lors du hachage des mots de passe
const SALT_ROUNDS = 10;

// Fonction d'inscription
export const signUp = async (values: z.infer<typeof signUpSchema>) => {
  try {
    // Vérification si l'utilisateur existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email: values.email.toLowerCase() },
    });

    if (existingUser) {
      return { error: "User already exists", success: false };
    }

    // Hachage du mot de passe
    const salt = await genSalt(SALT_ROUNDS);
    const hashedPassword = await hash(values.password, salt);

    // Création de l'utilisateur dans la base de données
    const user = await prisma.user.create({
      data: {
        email: values.email.toLowerCase(),
        name: values.name,
        hashedPassword,
      },
    });

    // Création de la session utilisateur
    const session = await lucia.createSession(user.id, {});
    const sessionCookie = lucia.createSessionCookie(session.id);

    // Configuration du cookie de session
    cookies().set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes
    );

    return { success: true };
  } catch (error) {
    console.error("Error during sign up:", error);
    return { error: "Something went wrong during sign up", success: false };
  }
};

// Fonction de connexion
export const signIn = async (values: z.infer<typeof signInSchema>) => {
  try {
    // Recherche de l'utilisateur dans la base de données
    const user = await prisma.user.findUnique({
      where: { email: values.email.toLowerCase() },
    });

    if (!user || !user.hashedPassword) {
      return { success: false, error: "Invalid credentials" };
    }

    // Comparaison du mot de passe
    const passwordMatch = await compare(values.password, user.hashedPassword);
    if (!passwordMatch) {
      return { success: false, error: "Invalid credentials" };
    }

    // Création de la session si les identifiants sont corrects
    const session = await lucia.createSession(user.id, {});
    const sessionCookie = lucia.createSessionCookie(session.id);

    // Configuration du cookie de session
    cookies().set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes
    );

    return { success: true };
  } catch (error) {
    console.error("Error during sign in:", error);
    return { error: "Something went wrong during sign in", success: false };
  }
};

// Fonction de déconnexion
export const logOut = async () => {
  try {
    // Créer un cookie de session vide (suppression du cookie)
    const sessionCookie = lucia.createBlankSessionCookie();

    // Suppression du cookie de session
    cookies().set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes
    );

    // Retourner un indicateur de succès
    return { success: true };
  } catch (error) {
    console.error("Error during log out:", error);
    return { success: false, error: "logout_failed" };
  }
};
