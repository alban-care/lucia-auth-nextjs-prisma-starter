import { Lucia } from "lucia";
import { PrismaAdapter } from "@lucia-auth/adapter-prisma";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

const adapter = new PrismaAdapter(prisma.session, prisma.user);

// Initialisation de Lucia avec les options de cookie de session
export const lucia = new Lucia(adapter, {
  sessionCookie: {
    name: "quantum-auth",
    expires: false, // La session ne doit pas expirer automatiquement
    attributes: {
      secure: process.env.NODE_ENV === "production", // Utiliser uniquement en production
      sameSite: "lax", // Empêche les requêtes externes non sécurisées
      path: "/", // Définit la portée du cookie pour toute l'application
    },
  },
});

// Fonction pour récupérer l'utilisateur en validant la session
export const getUser = async () => {
  try {
    // Récupérer l'ID de session à partir des cookies
    const sessionId = cookies().get(lucia.sessionCookieName)?.value || null;

    if (!sessionId) {
      return null; // Pas de session trouvée
    }

    // Validation de la session avec Lucia
    const { session, user } = await lucia.validateSession(sessionId);

    // Si la session est valide et fraîche, rafraîchir le cookie
    if (session && session.fresh) {
      const sessionCookie = await lucia.createSessionCookie(session.id);
      cookies().set(
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes
      );
    }

    // Si la session est invalide, supprimer le cookie de session
    if (!session) {
      const blankSessionCookie = lucia.createBlankSessionCookie();
      cookies().set(
        blankSessionCookie.name,
        blankSessionCookie.value,
        blankSessionCookie.attributes
      );
      return null;
    }

    // Récupérer les informations de l'utilisateur dans la base de données
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        name: true,
        email: true,
        picture: true, // Ajouter les champs nécessaires
      },
    });

    return dbUser;
  } catch (error) {
    console.error("Error fetching user session:", error);
    return null; // En cas d'erreur, renvoyer `null`
  }
};
