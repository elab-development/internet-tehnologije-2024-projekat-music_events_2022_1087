# Echo — React/Laravel aplikacija za organizovanje muzičkih događaja

![Logo](./music-events-react/public/assets/logo.png)

**Echo** je full-stack web aplikacija (Frontend: **React**, Backend: **Laravel**) za pregled, upravljanje i rezervaciju muzičkih događaja (koncerti, festivali, opera…), sa ocenama/recenzijama kupaca, analitikom i izvozom rezervacija u **Excel**. Aplikacija podržava korisničke i menadžerske uloge.

---

## Karakteristike

- 🧑‍💻 **Autentikacija** (registracija, prijava, odjava) uz **Laravel Sanctum** access tokene  
- 🔐 **Uloge**: korisnik (kupac) i **menadžer**
- 🎫 **Rezervacije (Bookings)**: kreiranje, izmena, brisanje sopstvenih rezervacija
- ⭐ **Recenzije (Reviews)**: korisnik može da oceni događaj koji je zaista rezervisao
- 🎵 **Događaji (Events)**:
  - **Menadžer**: kreiranje, izmena, brisanje
  - **Korisnik**: pregled i detalji (Show More)
- 📊 **Analitika (Analytics)** za menadžere: KPI kartice, grafikoni (Recharts), **Export to Excel**
- 🧭 **UI/UX**: crno-beli vizuelni identitet, bočna navigacija, responzivni raspored
- 🗺️ **Mapa** na stranici detalja događaja (komponenta `MapComponent`)
- 🖼️ **Slike** događaja (hook `useImages`) i promo oglas (`AdPopup`)
- 💾 **Session Storage**: čuva se `token` i `user`; frontend prikazuje navigaciju/footera samo kada je korisnik prijavljen

---

## Tehnologije

- **Frontend**: React (React Router, Recharts), CSS (App.css), Session Storage
- **Backend**: Laravel, Eloquent ORM, Laravel Sanctum, Form Request validacija
- **Baza**: MySQL (ili druga kompatibilna)
- **Izvoz u Excel**: `maatwebsite/excel`

---

## Korisničke uloge

Role u Echo aplikaciji su jednostavne ali strogo sprovedene na **frontendu (UI logika)** i, što je važnije, na **backendu (serverske provere)**. Na taj način, čak i ako se neko snađe da prikaže skrivene kontrole u interfejsu, Laravel kontroleri i dalje neće dozvoliti akcije bez odgovarajućih prava.

### Neulogovani korisnik (gost)
Gost može da **pregleda listu događaja** i **detalje događaja** (naslov, opis, mesto, vreme, cena), kao i **recenzije** drugih korisnika. Međutim, svaki pokušaj da:
- rezerviše karte (**Book Now**),
- piše recenziju,
- pristupi ličnim rezervacijama,
- ili uđe u deo **Analytics**,

biće preusmeren na **Login** stranicu, jer su ove akcije dostupne isključivo prijavljenim korisnicima. UI takođe prilagođava navigaciju – kada u session storage ne postoji `user`/`token`, **Navigation** i **Footer** su sakriveni, kako je implementirano u `App.js` (periodično čitanje iz session storage-a).

### Običan korisnik (kupac)
Posle uspešne prijave (Sanctum token), frontend čuva `token` i `user` u **sessionStorage** i proširuje navigaciju (tipično: **Home, Events, Subscription Plans, Bookings, Logout**). Običan korisnik može da:
- pravi **rezervacije** (Booking → `POST /api/bookings`),
- menja broj karata ili **briše** sopstvene rezervacije (Update/Delete → kontrola vlasništva u `BookingController`),
- ostavi **recenziju** za događaj **samo ako** ima sopstvenu rezervaciju za taj događaj i **već ne postoji** recenzija za tu rezervaciju (`POST /api/bookings/{bookingId}/reviews`).

Običan korisnik **ne može** da kreira/menja/briše događaje niti da pristupi **Analytics** i **Export to Excel**. UI to krije (nema menadžerskih dugmadi), ali i server to strogo zabranjuje (provere `is_manager` u kontrolerima).

### Menadžer
Menadžer je korisnik sa `is_manager = 1`. Nakon prijave, navigacija se menja u **Home, Events, Analytics, Logout** i otključava menadžerske funkcije:
- Na stranici **Events** menadžer vidi **Create** (modal), kao i **Edit** i **Delete** na svakoj kartici (uređivanje se otvara u **modal/portal** komponenti da ne remeti grid).
- **Show More** dugme je skriveno menadžerima, jer je njihov fokus na upravljanju događajima.
- Stranica **Analytics** prikazuje **KPI kartice** i **grafikone** (Recharts), uz mogućnost **Export to Excel** (`GET /api/bookings/export`) – dostupno isključivo menadžerima.
- Menadžeri **ne mogu da ostavljaju recenzije** (zabranjeno u `ReviewController`), čime se izbegava konflikt interesa.

Napomena: iako menadžer vidi sopstvene rezervacije (endpiont `GET /api/bookings` je definisan da vraća **samo** rezervacije prijavljenog korisnika), kompletne agregirane brojke dobija kroz **stats** endpoint (npr. `GET /api/bookings/stats`) i Excel export koji obuhvata **sve rezervacije**. Time su operativne radnje (rad sa događajima/rezervacijama) odvojene od izveštaja i analitike.

### Bezbednost i sprovođenje pravila
- **Sanctum Bearer token** se šalje u `Authorization` zaglavlju; backend rute koje menjaju podatke su zaštićene `auth:sanctum`.
- Dodatne serverske provere (npr. `auth()->user()->is_manager`, proveravanje vlasništva nad rezervacijom) su prisutne u svakom kontroleru kako bi se sprečila zloupotreba.
- UI samo **pomaže** korisniku da ne vidi ono što nema pravo da koristi; **Laravel** je poslednja i ključna linija odbrane.

---
Instalacija i pokretanje
---------------------------

1. Klonirajte repozitorijum:
```bash
    git clone https://github.com/elab-development/internet-tehnologije-2024-projekat-music_events_2022_1087.git
```
2. Pokrenite backend:
```bash
   cd music-events-laravel
   composer install
   php artisan migrate:fresh --seed
   php artisan serve
```
    
3. Pokrenite frontend:
```bash
   cd music-events-react
   npm install
   npm start
```
    
4.  Frontend pokrenut na: [http://localhost:3000](http://localhost:3000) Backend API pokrenut na: [http://127.0.0.1:8000/api](http://127.0.0.1:8000/api)
