// src/app/api/decrypt/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { ClientSecretCredential } from '@azure/identity';
import { CryptographyClient, KeyClient } from '@azure/keyvault-keys';
import { Buffer } from 'buffer';

export const runtime = 'edge';         // O 'nodejs' si prefieres
export const revalidate = 0;           // Sin cache para siempre pedir desencriptado fresco

export async function POST(request: NextRequest) {
    try {
        // Leer el cuerpo con el ciphertext
        const { ciphertext } = (await request.json()) as { ciphertext?: string };
        if (!ciphertext) {
            return NextResponse.json({ error: 'Missing ciphertext' }, { status: 400 });
        }

        // Inicializar credenciales de Azure
        const credential = new ClientSecretCredential(
            process.env.AZURE_TENANT_ID!,
            process.env.AZURE_CLIENT_ID!,
            process.env.AZURE_CLIENT_SECRET!
        );
        const vaultUrl = process.env.AZURE_KEYVAULT_URL!;
        const keyName  = 'Software-Key';   // Igual que en tu encrypt.ts

        // Obtener la clave de Key Vault
        const keyClient = new KeyClient(vaultUrl, credential);
        const key       = await keyClient.getKey(keyName);
        if (!key.id) throw new Error('Key ID indefinido');

        // Desencriptar con CryptographyClient
        const crypto = new CryptographyClient(key.id, credential);
        const cipherBuf = Buffer.from(ciphertext, 'base64');
        const decryptResult = await crypto.decrypt({
            algorithm: 'RSA-OAEP',
            ciphertext: cipherBuf,
        });

        // Convertir a texto y responder
        const plaintext = Buffer.from(decryptResult.result).toString();
        return NextResponse.json({ plaintext });

    } catch (err: any) {
        console.error('Decrypt Error:', err);
        return NextResponse.json(
            { error: err.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}