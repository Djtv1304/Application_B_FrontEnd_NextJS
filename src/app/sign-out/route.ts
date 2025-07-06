'use server';

import { signOut } from "@workos-inc/authkit-nextjs";

// export async function GET() {
//   await signOut({
//     returnTo: 'http://localhost:3000/',
//   });
// }

export async function signOutAction() {
  // WorkOS se encarga de limpiar la cookie y devolver un redirect 302
  await signOut({ returnTo: 'http://localhost:3000/' });
}