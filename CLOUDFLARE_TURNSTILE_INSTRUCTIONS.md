# Integracja Cloudflare Turnstile ze stroną hostowaną na Vercel (Nuxt 3)

Poniżej znajdziesz instrukcję krok po kroku, jak zintegrować Cloudflare Turnstile (nowoczesną i niewidoczną alternatywę dla reCAPTCHA) w Twojej aplikacji Nuxt 3, która jest hostowana na Vercelu.

## Krok 1: Utworzenie i konfiguracja usługi Cloudflare Turnstile

1. Zaloguj się na swoje konto [Cloudflare Dashboard](https://dash.cloudflare.com/).
2. W lewym menu nawigacyjnym wybierz opcję **Turnstile**.
3. Kliknij przycisk **Add site** (Dodaj stronę).
4. Wypełnij formularz:
   - **Site name:** Wpisz dowolną nazwę (np. "Formularz Kontaktowy Becia").
   - **Domain:** Wpisz domenę swojej strony hostowanej na Vercel (np. `becia.pl` oraz ewentualnie subdomenę wygenerowaną przez Vercel dla testów, np. `twoja-nazwa.vercel.app`).
   - **Widget Mode:** Wybierz opcję **Managed** lub **Invisible** (Najmniej uciążliwa dla użytkownika jest "Invisible", ale "Managed" pozwala Turnstile zdecydować, czy użytkownik musi np. kliknąć pole wyboru). Dla pełnej niewidoczności wybierz *Invisible*.
5. Po zapisaniu Cloudflare wygeneruje dla Ciebie dwa klucze:
   - **Site Key** (Klucz publiczny witryny) – używany na frontendzie.
   - **Secret Key** (Klucz tajny) – używany na backendzie do weryfikacji.

*Zapisz te klucze, będą one potrzebne w kolejnych krokach.*

## Krok 2: Dodanie kluczy jako Zmienne Środowiskowe (Environment Variables) w Vercel

Vercel pozwala na bezpieczne przechowywanie kluczy bez ujawniania ich w publicznym kodzie.

1. Zaloguj się do [Vercel Dashboard](https://vercel.com/dashboard).
2. Przejdź do ustawień Twojego projektu (Wybierz projekt -> **Settings**).
3. Wybierz zakładkę **Environment Variables** (Zmienne środowiskowe).
4. Dodaj dwie nowe zmienne:
   - **Key:** `NUXT_TURNSTILE_SITE_KEY`
     - **Value:** [Wklej tutaj swój *Site Key* z Cloudflare]
     - Zaznacz środowiska (Production, Preview, Development), w których ma to działać.
   - **Key:** `NUXT_TURNSTILE_SECRET_KEY`
     - **Value:** [Wklej tutaj swój *Secret Key* z Cloudflare]
     - Ponownie zaznacz odpowiednie środowiska.
5. Kliknij **Save**. Po dodaniu zmiennych konieczne będzie zrobienie nowego wdrożenia (Redeploy) z poziomu zakładki *Deployments*, aby zmienne zostały wczytane.

---

## Jak to działa w kodzie (Nuxt 3 + moduł @nuxtjs/turnstile)?

Poniżej opisane są zmiany, które zostały wdrożone w Twoim projekcie:

### 1. Instalacja wtyczki
Aplikacja wykorzystuje moduł `@nuxtjs/turnstile`.
- Moduł ten zajmuje się ładowaniem zewnętrznych skryptów Cloudflare, obsługą tokenów na frontendzie oraz udostępnia narzędzia do łatwej weryfikacji po stronie backendu (Nitro).

### 2. Konfiguracja w `nuxt.config.ts`
Moduł jest włączony i skonfigurowany w `nuxt.config.ts`. Ze względów bezpieczeństwa wartości pobierane są bezpośrednio z wbudowanych zmiennych środowiskowych `NUXT_TURNSTILE_...`.
```typescript
export default defineNuxtConfig({
  modules: [
    '@nuxtjs/turnstile'
  ],
  turnstile: {
    siteKey: process.env.NUXT_TURNSTILE_SITE_KEY, // Zostanie zaczytany z Vercel ENV
  }
})
```

### 3. Frontend: Dodanie komponentu w formularzu (`app/components/content/Contact.vue`)
Do formularza kontaktowego został dodany specjalny komponent `<NuxtTurnstile>`.
Gdy Turnstile zweryfikuje użytkownika, generuje token. Token ten dołączamy do reszty danych w formularzu (np. imię, email) przed wysłaniem na serwer.

```vue
<template>
  <form @submit.prevent="submitForm">
    <!-- Pola formularza... -->

    <!-- Widget Turnstile -->
    <NuxtTurnstile v-model="form.turnstileToken" />

    <button type="submit">Wyślij</button>
  </form>
</template>

<script setup>
const form = ref({
  name: '',
  email: '',
  message: '',
  turnstileToken: '' // Pole na token od Cloudflare
})
// ... reszta logiki
</script>
```

### 4. Backend: Weryfikacja tokena (`server/api/contact.post.ts`)
Najważniejszy krok dla bezpieczeństwa przed botami. Otrzymany od klienta formularz, wraz z przypisanym tokenem, trafia do Twojego API. W tym miejscu, używając funkcji pomocniczej `verifyTurnstileToken`, sprawdzamy w Cloudflare czy interakcja była autentyczna.

```typescript
export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  // 1. Sprawdzanie tokenu Cloudflare Turnstile
  if (!body.turnstileToken) {
    throw createError({ statusCode: 400, statusMessage: 'Brak weryfikacji anty-botowej (Turnstile).' })
  }

  // Weryfikacja tokenu komunikująca się z API Cloudflare
  const turnstileResponse = await verifyTurnstileToken(body.turnstileToken, event)

  if (!turnstileResponse.success) {
    throw createError({ statusCode: 400, statusMessage: 'Weryfikacja anty-botowa nie powiodła się.' })
  }

  // 2. Jeśli wszystko jest ok, następuje normalna wysyłka e-maila
  // ...
})
```

### Czym różni się Cloudflare Turnstile od Google reCAPTCHA?
- **Prywatność:** Turnstile nie śledzi użytkowników w celach reklamowych (w przeciwieństwie do reCAPTCHA Google).
- **UX (User Experience):** W 99% przypadków Turnstile wykonuje bezobsługowy challenge w tle i nigdy nie pyta użytkownika o klikanie w obrazki ze "sygnalizacją świetlną" lub "przejściami dla pieszych".
- **Szybkość:** Jest natywne dla infrastruktury Cloudflare, co oznacza niesamowicie szybką odpowiedź weryfikacyjną.
