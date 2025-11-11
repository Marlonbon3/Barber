import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PaymentRequest {
  amount: number;
  currency: string;
  serviceId: string;
  barberId: string;
  description: string;
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Obtener el Stripe secret key del entorno
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')
    if (!stripeSecretKey) {
      throw new Error('STRIPE_SECRET_KEY no está configurado')
    }

    const { amount, currency = 'mxn', serviceId, barberId, description }: PaymentRequest = await req.json()

    // Crear el Payment Intent con Stripe API
    const stripeResponse = await fetch('https://api.stripe.com/v1/payment_intents', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${stripeSecretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        amount: (amount * 100).toString(), // Stripe usa centavos
        currency: currency,
        automatic_payment_methods: JSON.stringify({
          enabled: true,
        }),
        description: description,
        metadata: JSON.stringify({
          service_id: serviceId,
          barber_id: barberId,
          source: 'barberia_app'
        })
      }).toString(),
    })

    const paymentIntent = await stripeResponse.json()

    if (!stripeResponse.ok) {
      console.error('Error de Stripe:', paymentIntent)
      throw new Error(paymentIntent.error?.message || 'Error al crear Payment Intent')
    }

    // Responder con el client_secret
    return new Response(
      JSON.stringify({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Error en create-payment-intent:', error)
    return new Response(
      JSON.stringify({
        error: error.message || 'Error interno del servidor'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})