// lib/email.ts
import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
})

interface EmailOptions {
  to: string
  subject: string
  html: string
  from?: string
}

export async function sendEmail({ to, subject, html, from }: EmailOptions) {
  try {
    const info = await transporter.sendMail({
      from: from || process.env.GMAIL_USER,
      to,
      subject,
      html,
    })

    return { success: true, data: info }
  } catch (error) {
    console.error('Email service error:', error)
    return { success: false, error }
  }
}

// Email templates
export const emailTemplates = {
  orderConfirmation: (orderNumber: string, customerName: string) => ({
    subject: `Commande confirmée - ${orderNumber}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Commande confirmée</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #d4920c, #e8aa1f); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #d4920c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Commande confirmée !</h1>
              <p>Merci pour votre confiance, ${customerName}</p>
            </div>
            <div class="content">
              <h2>Votre commande ${orderNumber} a été confirmée</h2>
              <p>Nous traitons votre commande et vous tiendrons informé de son évolution.</p>
              <p>Vous pouvez suivre votre commande en temps réel sur votre espace client.</p>
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/store/orders" class="button">Suivre ma commande</a>
              <p><strong>Questions ?</strong> Notre service client est à votre disposition.</p>
            </div>
            <div class="footer">
              <p>Cet email a été envoyé automatiquement. Merci de ne pas répondre.</p>
            </div>
          </div>
        </body>
      </html>
    `
  }),

  orderStatusUpdate: (orderNumber: string, status: string, customerName: string) => {
    const statusMessages = {
      'CONFIRMED': 'Votre commande a été validée avec succès ! Nous préparons vos articles et vous les livrerons dans les plus brefs délais.',
      'SHIPPED': 'Votre commande a été expédiée ! Vous la recevrez bientôt.',
      'DELIVERED': 'Votre commande a été livrée avec succès. Merci !',
      'CANCELLED': 'Votre commande a été annulée conformément à votre demande.',
    }

    const message = statusMessages[status as keyof typeof statusMessages] || 'Le statut de votre commande a été mis à jour.'

    return {
      subject: `Mise à jour commande ${orderNumber}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Mise à jour commande</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #d4920c, #e8aa1f); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .button { display: inline-block; background: #d4920c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
              .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
              .success-box { background: #f0fdf4; border: 1px solid #22c55e; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center; }
              .success-box h3 { color: #16a34a; margin: 0 0 10px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🎉 Commande validée !</h1>
                <p>${customerName}</p>
              </div>
              <div class="content">
                <h2>Commande ${orderNumber}</h2>
                ${status === 'CONFIRMED' ? `
                  <div class="success-box">
                    <h3>✅ Votre commande a été validée avec succès</h3>
                    <p>Nous préparons vos articles avec soin et vous les livrerons dans les plus brefs délais.</p>
                  </div>
                ` : ''}
                <p>${message}</p>
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/store/orders" class="button">Voir mes commandes</a>
                <p>Pour toute question, n'hésitez pas à contacter notre service client.</p>
              </div>
              <div class="footer">
                <p>Cet email a été envoyé automatiquement. Merci de ne pas répondre.</p>
              </div>
            </div>
          </body>
        </html>
      `
    }
  },

  paymentReminder: (orderNumber: string, customerName: string, amount: string) => ({
    subject: `Rappel de paiement - Commande ${orderNumber}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Rappel de paiement</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #ef4444, #dc2626); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #d4920c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
            .highlight { background: #fef3c7; padding: 15px; border-left: 4px solid #d4920c; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Rappel de paiement</h1>
              <p>${customerName}</p>
            </div>
            <div class="content">
              <h2>Commande ${orderNumber}</h2>
              <div class="highlight">
                <p><strong>Montant à payer :</strong> ${amount}</p>
                <p>Votre commande est en attente de paiement.</p>
              </div>
              <p>Pour finaliser votre commande et recevoir vos articles, veuillez procéder au paiement.</p>
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/store/checkout" class="button">Finaliser le paiement</a>
              <p>Si vous avez déjà effectué le paiement, veuillez ignorer cet email.</p>
              <p>Pour toute assistance, contactez notre service client.</p>
            </div>
            <div class="footer">
              <p>Cet email a été envoyé automatiquement. Merci de ne pas répondre.</p>
            </div>
          </div>
        </body>
      </html>
    `
  }),

  paymentSuccess: (orderNumber: string, customerName: string, amount: string) => ({
    subject: `Paiement réussi - Commande ${orderNumber}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Paiement réussi</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #22c55e, #16a34a); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #d4920c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
            .success-box { background: #f0fdf4; border: 1px solid #22c55e; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center; }
            .success-box h3 { color: #16a34a; margin: 0 0 10px 0; }
            .order-info { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 20px 0; }
            .order-info h4 { color: #1e293b; margin: 0 0 15px 0; }
            .order-info p { margin: 5px 0; color: #475569; }
            .highlight { color: #d4920c; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>💳 Paiement réussi !</h1>
              <p>${customerName}</p>
            </div>
            <div class="content">
              <div class="success-box">
                <h3>✅ Paiement effectué avec succès</h3>
                <p>Veuillez noter votre numéro de commande pour suivi</p>
              </div>
              
              <div class="order-info">
                <h4>📋 Détails de la commande</h4>
                <p><strong>Numéro de commande:</strong> <span class="highlight">${orderNumber}</span></p>
                <p><strong>Montant payé:</strong> <span class="highlight">${amount}</span></p>
                <p><strong>Date:</strong> ${new Date().toLocaleDateString('fr-FR')}</p>
              </div>

              <h3>🚚 Livraison</h3>
              <p>Un livreur vous contactera dans moins de 24h pour la livraison.</p>
              <p>Veuillez rester disponible et garder votre téléphone à portée de main.</p>

              <a href="${process.env.NEXT_PUBLIC_APP_URL}/store/orders" class="button">Suivre ma commande</a>
              
              <p><strong>Questions ?</strong> Notre service client est à votre disposition pour toute information.</p>
            </div>
            <div class="footer">
              <p>Cet email a été envoyé automatiquement. Merci de ne pas répondre.</p>
            </div>
          </div>
        </body>
      </html>
    `
  }),

  adminPaymentNotification: (orderNumber: string, amount: string, customerName: string, customerEmail: string) => ({
    subject: `Nouveau paiement reçu - Commande ${orderNumber}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Nouveau paiement</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #3b82f6, #2563eb); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #d4920c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
            .payment-box { background: #eff6ff; border: 1px solid #3b82f6; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center; }
            .payment-box h3 { color: #1e40af; margin: 0 0 10px 0; }
            .order-info { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 20px 0; }
            .order-info h4 { color: #1e293b; margin: 0 0 15px 0; }
            .order-info p { margin: 5px 0; color: #475569; }
            .highlight { color: #22c55e; font-weight: bold; font-size: 1.2em; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>💰 Nouveau paiement reçu</h1>
              <p>Notification administrateur</p>
            </div>
            <div class="content">
              <div class="payment-box">
                <h3>✅ Paiement effectué avec succès</h3>
                <p>Un client vient de payer pour sa commande</p>
              </div>
              
              <div class="order-info">
                <h4>📋 Détails de la transaction</h4>
                <p><strong>Commande:</strong> ${orderNumber}</p>
                <p><strong>Montant reçu:</strong> <span class="highlight">${amount}</span></p>
                <p><strong>Client:</strong> ${customerName}</p>
                <p><strong>Email:</strong> ${customerEmail}</p>
                <p><strong>Date:</strong> ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}</p>
              </div>

              <h3>🎉 Actions requises</h3>
              <p>1. Confirmez la commande dans votre panneau d'administration</p>
              <p>2. Préparez les articles pour la livraison</p>
              <p>3. Contactez le livreur pour la planification</p>

              <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/orders" class="button">Voir la commande</a>
            </div>
            <div class="footer">
              <p>Cet email a été envoyé automatiquement depuis votre système.</p>
            </div>
          </div>
        </body>
      </html>
    `
  }),

  newsletterWelcome: (customerName: string) => ({
    subject: 'Bienvenue dans notre newsletter !',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Bienvenue</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #d4920c, #e8aa1f); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #d4920c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Bienvenue ${customerName} !</h1>
              <p>Nous sommes ravis de vous compter parmi nos abonnés</p>
            </div>
            <div class="content">
              <h2>Merci pour votre inscription</h2>
              <p>Vous recevrez désormais :</p>
              <ul>
                <li>Les meilleures offres exclusives</li>
                <li>Les nouvelles sorties en avant-première</li>
                <li>Des promotions personnalisées</li>
                <li>Des conseils et actualités</li>
              </ul>
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/store/products" class="button">Découvrir nos produits</a>
              <p>À très bientôt sur notre boutique !</p>
            </div>
            <div class="footer">
              <p>Pour vous désabonner, cliquez sur le lien en bas de nos emails.</p>
            </div>
          </div>
        </body>
      </html>
    `
  }),

  adminOTP: (code: string, expiresIn: number = 15) => ({
    subject: '🔒 Votre code d\'accès administrateur',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Code OTP Admin</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #1e293b, #0f172a); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .code-box { background: #1a1a2e; color: #fbbf24; padding: 30px; text-align: center; border-radius: 8px; margin: 30px 0; font-size: 32px; font-weight: bold; font-family: monospace; letter-spacing: 5px; }
            .warning { background: #fef3c7; border: 1px solid #f59e0b; border-left: 4px solid #d97706; padding: 15px; border-radius: 5px; margin: 20px 0; font-size: 14px; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Accès Administrateur</h1>
              <p>Connexion sécurisée à votre panel</p>
            </div>
            <div class="content">
              <h2>Votre code de vérification</h2>
              <p>Vous avez demandé un accès à votre panel d'administration. Utilisez le code ci-dessous pour valider votre connexion :</p>
              
              <div class="code-box">
                ${code}
              </div>
              
              <div class="warning">
                <strong>⚠️ Sécurité importante :</strong>
                <ul style="margin: 10px 0; padding-left: 20px;">
                  <li>Ce code expire dans ${expiresIn} minutes</li>
                  <li>Ne partagez jamais ce code avec quiconque</li>
                  <li>Si vous n'avez pas demandé cette connexion, ignorez cet email</li>
                </ul>
              </div>
              
              <p>Pour finaliser votre connexion, veuillez entrer ce code sur la page de connexion administrateur.</p>
            </div>
            <div class="footer">
              <p>Cet email a été envoyé automatiquement. Merci de ne pas répondre.</p>
              <p><small>© ${new Date().getFullYear()} e-comm-bf. Tous droits réservés.</small></p>
            </div>
          </div>
        </body>
      </html>
    `
  })
}
