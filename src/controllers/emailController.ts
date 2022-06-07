import { Request, Response } from 'express';
import nodemailer from 'nodemailer';
import { google } from 'googleapis';

import dotenv from 'dotenv';
dotenv.config();

export const contato = async (req: Request, res: Response) => {

    const { senderMail, name, txt } = req.body;

    if (senderMail === '' || name === '' || txt === '') {
        res.status(403).send();
        return;
    }

    //Configurar as credenciais
    const { OAuth2 } = google.auth;

    const email = process.env.EMAIL_ADRESS;

    const clientId = process.env.EMAIL_CLIENT_ID;
    const clientSecret = process.env.EMAIL_CLIENT_SECRET;
    const refreshToken = process.env.EMAIL_REFRESH_TOKEN;

    const OAuth2_client = new OAuth2(clientId, clientSecret);
    OAuth2_client.setCredentials({ refresh_token: refreshToken });

    const accessToken = OAuth2_client.getAccessToken();

    //Configurar o transporter
    let transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            type: 'OAuth2',
            user: email,
            clientId,
            clientSecret,
            refreshToken,
            accessToken: accessToken as unknown as string
        }
    });

    //Configurar a mensagem
    const message = {
        to: `${name} <${senderMail}>`,
        subject: `Nova mensagem de contato - ${name}`,
        html: `E-mail: ${senderMail}\n\nMensagem:\n${txt}`,
        text: `E-mail: ${senderMail}\n\nMensagem:\n${txt}`,
        replyTo: `${name} <${senderMail}>`
    };

    //Enviar a mensagem
    let info = await transporter.sendMail(message);
    res.json({ info });
}

