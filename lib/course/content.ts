/**
 * Treść mini-kursu inwestowania. Wszystkie materiały mają charakter edukacyjny
 * i nie stanowią rekomendacji inwestycyjnej.
 */
import type { CourseModule, LessonBlock } from './types';

const p = (text: string): LessonBlock => ({ type: 'paragraph', text });
const h = (text: string): LessonBlock => ({ type: 'heading', text });
const list = (items: string[], ordered = false): LessonBlock => ({ type: 'list', items, ordered });
const tip = (text: string, title = 'Wskazówka'): LessonBlock => ({ type: 'callout', variant: 'tip', title, text });
const warning = (text: string, title = 'Uwaga'): LessonBlock => ({ type: 'callout', variant: 'warning', title, text });
const example = (text: string, title = 'Przykład'): LessonBlock => ({ type: 'callout', variant: 'example', title, text });
const formula = (text: string, title = 'Wzór'): LessonBlock => ({ type: 'callout', variant: 'formula', title, text });
const terms = (items: Array<[string, string]>): LessonBlock => ({
  type: 'terms',
  terms: items.map(([term, definition]) => ({ term, definition })),
});

export const COURSE_MODULES: CourseModule[] = [
  /* ==========================================================================
   * POZIOM: POCZĄTKUJĄCY
   * ======================================================================= */
  {
    id: 'podstawy-gieldy',
    level: 'beginner',
    title: 'Podstawy rynku giełdowego',
    description: 'Dowiedz się, jak działa giełda, czym są akcje i jak wygląda droga zlecenia od kliknięcia do transakcji.',
    icon: 'landmark',
    reward: 2500,
    lessons: [
      {
        id: 'jak-dziala-gielda',
        title: 'Jak działa giełda',
        minutes: 4,
        blocks: [
          p('**Giełda papierów wartościowych** to zorganizowany rynek, na którym kupujący i sprzedający spotykają się, aby handlować akcjami, obligacjami i innymi instrumentami finansowymi. Sama giełda niczego nie sprzedaje – zapewnia infrastrukturę, zasady obrotu i nadzór nad tym, aby transakcje przebiegały uczciwie i przejrzyście.'),
          p('Największe giełdy świata to amerykańskie **NYSE** (New York Stock Exchange) i **Nasdaq**. W Polsce działa **Giełda Papierów Wartościowych w Warszawie (GPW)**. Sesja na giełdach w USA trwa zwykle od 9:30 do 16:00 czasu nowojorskiego, czyli przeważnie od 15:30 do 22:00 czasu polskiego.'),
          h('Rynek pierwotny i wtórny'),
          p('Gdy spółka po raz pierwszy sprzedaje swoje akcje inwestorom, mówimy o **ofercie publicznej (IPO)** na rynku pierwotnym – pieniądze trafiają wtedy bezpośrednio do firmy. Później akcje zmieniają właścicieli na **rynku wtórnym**: kupujesz je od innego inwestora, a nie od spółki. Zdecydowana większość codziennego handlu odbywa się właśnie na rynku wtórnym.'),
          h('Kto uczestniczy w rynku?'),
          list([
            '**Inwestorzy indywidualni** – osoby prywatne, takie jak Ty.',
            '**Inwestorzy instytucjonalni** – fundusze inwestycyjne, emerytalne, banki i firmy ubezpieczeniowe.',
            '**Animatorzy rynku (market makerzy)** – podmioty stale wystawiające oferty kupna i sprzedaży, dzięki czemu na rynku jest płynność.',
            '**Domy maklerskie (brokerzy)** – pośrednicy, przez których przekazujesz zlecenia na giełdę.',
          ]),
          tip('Cena akcji w danym momencie to po prostu cena ostatniej transakcji. Zmienia się, gdy zmienia się równowaga między popytem a podażą.'),
        ],
      },
      {
        id: 'czym-sa-akcje',
        title: 'Czym są akcje',
        minutes: 4,
        blocks: [
          p('**Akcja** to papier wartościowy, który potwierdza posiadanie części spółki akcyjnej. Kupując jedną akcję firmy Apple, stajesz się jej współwłaścicielem – co prawda w znikomym ułamku, ale z realnymi prawami.'),
          h('Jakie prawa daje akcja?'),
          list([
            '**Prawo do dywidendy** – udział w zysku, jeśli spółka zdecyduje się go wypłacić akcjonariuszom.',
            '**Prawo głosu** na walnym zgromadzeniu akcjonariuszy (WZA), np. przy wyborze rady nadzorczej.',
            '**Prawo poboru** – pierwszeństwo przy zakupie nowych akcji emitowanych przez spółkę.',
            '**Prawo do części majątku** w razie likwidacji spółki (po spłacie wierzycieli).',
          ]),
          h('Skąd bierze się zysk z akcji?'),
          p('Inwestor zarabia na dwa sposoby: na **wzroście ceny** akcji (zysk kapitałowy) oraz na **dywidendach**. Długoterminowo ceny akcji podążają za wynikami finansowymi spółek – jeśli firma zwiększa zyski, rośnie też jej wartość.'),
          formula('Kapitalizacja rynkowa = liczba akcji × cena jednej akcji', 'Kapitalizacja'),
          example('Spółka ma 1 mld akcji, a jedna akcja kosztuje 50 USD. Kapitalizacja rynkowa wynosi więc 50 mld USD – tyle rynek „wycenia” całą firmę.'),
          warning('Akcje nie gwarantują zysku. Cena może spaść znacznie poniżej ceny zakupu, a w skrajnym przypadku (bankructwo spółki) – nawet do zera.'),
        ],
      },
      {
        id: 'zlecenia-i-arkusz',
        title: 'Zlecenia i arkusz zleceń',
        minutes: 5,
        blocks: [
          p('Każda transakcja na giełdzie zaczyna się od **zlecenia** – polecenia kupna lub sprzedaży określonej liczby akcji. Zlecenia trafiają do **arkusza zleceń** (ang. order book), gdzie czekają na drugą stronę transakcji.'),
          terms([
            ['Bid (oferta kupna)', 'Najwyższa cena, jaką ktoś jest obecnie gotów zapłacić za akcję.'],
            ['Ask (oferta sprzedaży)', 'Najniższa cena, za jaką ktoś jest obecnie gotów sprzedać akcję.'],
            ['Spread', 'Różnica między ceną ask a bid. Im mniejszy spread, tym bardziej płynny instrument.'],
            ['Płynność', 'Łatwość, z jaką można kupić lub sprzedać instrument bez istotnego wpływu na jego cenę.'],
          ]),
          h('Najważniejsze typy zleceń'),
          list([
            '**Zlecenie rynkowe (Market, w Polsce często PKC – „po każdej cenie”)** – realizowane natychmiast po najlepszej dostępnej cenie. Gwarantuje wykonanie, ale nie gwarantuje ceny.',
            '**Zlecenie z limitem ceny (Limit)** – określasz maksymalną cenę kupna lub minimalną cenę sprzedaży. Gwarantuje cenę, ale nie gwarantuje wykonania.',
            '**Zlecenie Stop-Loss** – zamienia się w zlecenie rynkowe, gdy cena spadnie do ustalonego poziomu. Służy do ograniczania strat (szczegóły w kolejnym module).',
          ]),
          tip('W naszym symulatorze realizujesz zlecenia rynkowe – transakcja jest wykonywana natychmiast po bieżącej cenie, bez prowizji. To dobry sposób, aby skupić się na decyzjach, a nie na kosztach.', 'W symulatorze'),
          warning('W prawdziwym handlu zlecenie rynkowe na mało płynnej spółce może zostać zrealizowane po cenie znacznie gorszej od oczekiwanej. To zjawisko nazywamy poślizgiem cenowym (ang. slippage).'),
        ],
      },
      {
        id: 'indeksy-i-etf',
        title: 'Indeksy giełdowe i fundusze ETF',
        minutes: 4,
        blocks: [
          p('**Indeks giełdowy** to wskaźnik, który pokazuje zachowanie wybranej grupy spółek. Dzięki niemu jednym spojrzeniem ocenisz, czy rynek jako całość rośnie, czy spada.'),
          list([
            '**S&P 500** – 500 największych spółek notowanych w USA; najczęściej używany barometr amerykańskiej gospodarki.',
            '**Nasdaq-100** – 100 największych niefinansowych spółek z giełdy Nasdaq, z dużym udziałem sektora technologicznego.',
            '**Dow Jones Industrial Average** – 30 dużych, renomowanych spółek amerykańskich.',
            '**WIG20** – 20 największych i najbardziej płynnych spółek z warszawskiej GPW.',
          ]),
          h('Czym jest ETF?'),
          p('**ETF (Exchange Traded Fund)** to fundusz notowany na giełdzie jak zwykła akcja, który odwzorowuje zachowanie indeksu, surowca lub koszyka spółek. Kupując jeden ETF na S&P 500 (np. SPY lub VOO), inwestujesz jednocześnie w 500 firm.'),
          list([
            'Natychmiastowa dywersyfikacja przy małym kapitale.',
            'Niskie koszty zarządzania w porównaniu z tradycyjnymi funduszami.',
            'Prostota – nie musisz analizować każdej spółki z osobna.',
          ]),
          tip('Dodaj SPY lub QQQ do listy obserwowanych na pulpicie i porównuj ich zachowanie z pojedynczymi spółkami. Zauważysz, że indeksy wahają się zwykle znacznie mniej niż pojedyncze akcje.', 'Ćwiczenie praktyczne'),
        ],
      },
    ],
    quiz: [
      {
        id: 'q1',
        question: 'Co oznacza zakup akcji na rynku wtórnym?',
        options: [
          'Kupujesz akcje bezpośrednio od spółki, która pozyskuje w ten sposób kapitał.',
          'Kupujesz akcje od innego inwestora, a spółka nie otrzymuje tych pieniędzy.',
          'Pożyczasz pieniądze spółce w zamian za stałe odsetki.',
          'Kupujesz prawo do akcji, które zostaną wyemitowane w przyszłości.',
        ],
        correctIndex: 1,
        explanation: 'Na rynku wtórnym akcje zmieniają właściciela między inwestorami. Spółka otrzymuje pieniądze tylko na rynku pierwotnym, np. podczas IPO.',
      },
      {
        id: 'q2',
        question: 'Spółka ma 200 mln akcji, a jedna akcja kosztuje 25 USD. Ile wynosi jej kapitalizacja rynkowa?',
        options: ['225 mln USD', '8 mln USD', '5 mld USD', '50 mld USD'],
        correctIndex: 2,
        explanation: 'Kapitalizacja = liczba akcji × cena = 200 000 000 × 25 USD = 5 000 000 000 USD, czyli 5 mld USD.',
      },
      {
        id: 'q3',
        question: 'Czym jest spread?',
        options: [
          'Różnicą między najniższą ofertą sprzedaży (ask) a najwyższą ofertą kupna (bid).',
          'Prowizją pobieraną przez dom maklerski.',
          'Różnicą między ceną otwarcia a ceną zamknięcia sesji.',
          'Częścią zysku spółki wypłacaną akcjonariuszom.',
        ],
        correctIndex: 0,
        explanation: 'Spread to różnica między ceną ask a bid. Wąski spread świadczy o wysokiej płynności instrumentu.',
      },
      {
        id: 'q4',
        question: 'Które zlecenie gwarantuje wykonanie, ale nie gwarantuje ceny?',
        options: ['Zlecenie z limitem ceny', 'Zlecenie rynkowe (PKC)', 'Zlecenie anulowane', 'Żadne zlecenie nie gwarantuje wykonania'],
        correctIndex: 1,
        explanation: 'Zlecenie rynkowe jest realizowane natychmiast po najlepszej dostępnej cenie – wykonanie jest pewne, ale cena może odbiegać od oczekiwanej.',
      },
      {
        id: 'q5',
        question: 'Jaka jest główna zaleta funduszu ETF na indeks S&P 500 dla początkującego inwestora?',
        options: [
          'Gwarantuje coroczny zysk.',
          'Nie podlega wahaniom cen.',
          'Zapewnia szeroką dywersyfikację jednym zakupem i przy niskich kosztach.',
          'Pozwala głosować na walnych zgromadzeniach wszystkich 500 spółek.',
        ],
        correctIndex: 2,
        explanation: 'ETF odwzorowuje cały indeks, więc jednym zakupem rozkładasz kapitał na wiele spółek. Nie chroni to jednak przed spadkami całego rynku.',
      },
    ],
  },

  {
    id: 'ryzyko-podstawy',
    level: 'beginner',
    title: 'Ryzyko i dywersyfikacja – pierwsze kroki',
    description: 'Poznaj zależność między ryzykiem a zyskiem, naucz się dywersyfikować portfel i chronić kapitał zleceniem Stop-Loss.',
    icon: 'shield',
    reward: 2500,
    lessons: [
      {
        id: 'ryzyko-a-zysk',
        title: 'Ryzyko a stopa zwrotu',
        minutes: 4,
        blocks: [
          p('W inwestowaniu obowiązuje prosta zasada: **im wyższy potencjalny zysk, tym wyższe ryzyko**. Lokata bankowa jest bezpieczna, ale przynosi niewiele. Akcje młodych spółek technologicznych mogą przynieść kilkaset procent zysku – albo stracić większość wartości.'),
          p('Ryzyko inwestycyjne najczęściej mierzy się **zmiennością** (ang. volatility), czyli tym, jak silnie i jak często cena odchyla się od średniej. Akcje firm takich jak Tesla czy Palantir potrafią zmienić cenę o kilka procent w ciągu jednego dnia, podczas gdy Coca-Cola porusza się znacznie spokojniej.'),
          h('Asymetria strat'),
          p('Straty działają na Twoją niekorzyść mocniej, niż mogłoby się wydawać. Aby odrobić stratę, potrzebujesz procentowo większego zysku:'),
          list([
            'Strata 10% wymaga zysku 11,1%, aby wrócić do punktu wyjścia.',
            'Strata 25% wymaga zysku 33,3%.',
            'Strata 50% wymaga zysku aż 100%.',
            'Strata 80% wymaga zysku 400%.',
          ]),
          warning('Dlatego pierwszym celem inwestora nie jest maksymalizacja zysku, lecz ochrona kapitału. Kto unika dużych strat, ten ma czas, by zyski mogły pracować.'),
          tip('Przed każdą transakcją zadaj sobie pytanie: „Ile mogę na tym stracić?”, a nie tylko „Ile mogę zarobić?”.'),
        ],
      },
      {
        id: 'dywersyfikacja',
        title: 'Dywersyfikacja portfela',
        minutes: 4,
        blocks: [
          p('**Dywersyfikacja** to rozkładanie kapitału na wiele różnych inwestycji, tak aby słabe wyniki jednej z nich nie zrujnowały całego portfela. To jedyny „darmowy obiad” w finansach – obniża ryzyko bez proporcjonalnego obniżania oczekiwanego zysku.'),
          h('Jak dywersyfikować?'),
          list([
            '**Między spółkami** – zamiast jednej firmy posiadaj kilkanaście lub więcej.',
            '**Między sektorami** – technologia, ochrona zdrowia, finanse, energetyka i dobra konsumpcyjne reagują inaczej na te same wydarzenia.',
            '**Między klasami aktywów** – akcje, obligacje, gotówka czy surowce.',
            '**Geograficznie** – rynki USA, Europy i rynki wschodzące.',
          ]),
          example('Portfel złożony wyłącznie z NVDA, AMD i AVGO wydaje się zróżnicowany, bo to trzy spółki. W praktyce wszystkie należą do sektora półprzewodników i często spadają jednocześnie. Dodanie spółek z sektora ochrony zdrowia (JNJ) i dóbr konsumpcyjnych (PG) znacznie lepiej rozkłada ryzyko.'),
          tip('Wykres alokacji aktywów na pulpicie pokazuje, jaką część portfela zajmuje każda pozycja. Jeśli jedna spółka przekracza 25–30% wartości portfela, zastanów się, czy nie jesteś zbyt mocno uzależniony od jej wyników.', 'W symulatorze'),
          warning('Nadmierna dywersyfikacja też ma wady: przy 100 pozycjach trudno śledzić każdą z nich, a wynik portfela i tak zbliża się do wyniku indeksu. Często prościej wtedy kupić ETF.'),
        ],
      },
      {
        id: 'stop-loss',
        title: 'Zlecenie Stop-Loss – Twoja polisa ubezpieczeniowa',
        minutes: 5,
        blocks: [
          p('**Stop-Loss** (dosłownie „zatrzymaj stratę”) to zlecenie, które automatycznie sprzedaje akcje, gdy ich cena spadnie do wyznaczonego poziomu. Decyzję o maksymalnej stracie podejmujesz na chłodno, zanim emocje wezmą górę.'),
          example('Kupujesz akcje po 100 USD i ustawiasz Stop-Loss na 92 USD. Jeśli kurs spadnie do 92 USD, zlecenie zostanie aktywowane i akcje zostaną sprzedane. Twoja strata wyniesie około 8% zamiast potencjalnie 30% czy 50%.'),
          h('Jak ustalić poziom Stop-Loss?'),
          list([
            '**Metoda procentowa** – np. 5–10% poniżej ceny zakupu. Prosta, ale ignoruje zachowanie wykresu.',
            '**Metoda techniczna** – poniżej ważnego poziomu wsparcia lub ostatniego dołka. Jeśli cena go przebije, Twoja teza inwestycyjna przestaje być aktualna.',
            '**Metoda zmienności** – odległość dopasowana do typowych wahań danej spółki, aby zwykły „szum” nie wyrzucał Cię z pozycji.',
          ]),
          h('Trailing Stop – kroczący Stop-Loss'),
          p('Odmianą Stop-Lossa jest **trailing stop**, który przesuwa się w górę razem z rosnącą ceną, ale nigdy w dół. Pozwala chronić wypracowany zysk, nie ograniczając dalszych wzrostów.'),
          warning('Stop-Loss jest zleceniem rynkowym po aktywacji. Przy gwałtownej luce cenowej (np. po słabym raporcie ogłoszonym po sesji) sprzedaż może nastąpić poniżej ustalonego poziomu.'),
          tip('Najczęstszy błąd początkujących to przesuwanie Stop-Lossa w dół, „bo zaraz odbije”. Raz ustalony poziom ryzyka powinien być święty.'),
        ],
      },
    ],
    quiz: [
      {
        id: 'q1',
        question: 'Twój portfel stracił 50%. Jaki zysk jest potrzebny, aby wrócić do wartości początkowej?',
        options: ['50%', '75%', '100%', '150%'],
        correctIndex: 2,
        explanation: 'Po stracie 50% ze 100 USD zostaje 50 USD. Aby wrócić do 100 USD, kapitał musi się podwoić, czyli wzrosnąć o 100%.',
      },
      {
        id: 'q2',
        question: 'Który portfel jest najlepiej zdywersyfikowany?',
        options: [
          'NVDA, AMD, AVGO, INTC',
          'JPM, BAC, GS',
          'AAPL, JNJ, XOM, PG, JPM',
          '100% gotówki w jednej walucie',
        ],
        correctIndex: 2,
        explanation: 'Portfel AAPL, JNJ, XOM, PG i JPM obejmuje pięć różnych sektorów: technologię, ochronę zdrowia, energetykę, dobra konsumpcyjne i bankowość.',
      },
      {
        id: 'q3',
        question: 'Do czego służy zlecenie Stop-Loss?',
        options: [
          'Do automatycznego ograniczenia straty, gdy cena spadnie do ustalonego poziomu.',
          'Do zakupu akcji po możliwie najniższej cenie dnia.',
          'Do zablokowania możliwości sprzedaży akcji.',
          'Do zwiększenia pozycji, gdy cena spada.',
        ],
        correctIndex: 0,
        explanation: 'Stop-Loss sprzedaje akcje po osiągnięciu wyznaczonego poziomu ceny, dzięki czemu strata jest ograniczona do wcześniej zaplanowanej wielkości.',
      },
      {
        id: 'q4',
        question: 'Czym charakteryzuje się trailing stop?',
        options: [
          'Jest ustawiony na stałe i nigdy się nie zmienia.',
          'Przesuwa się w górę wraz ze wzrostem ceny, ale nie przesuwa się w dół.',
          'Działa tylko w dniu zakupu akcji.',
          'Automatycznie dokupuje akcje po spadku ceny.',
        ],
        correctIndex: 1,
        explanation: 'Kroczący Stop-Loss podąża za rosnącą ceną, chroniąc wypracowany zysk, ale nigdy nie obniża poziomu ochrony.',
      },
      {
        id: 'q5',
        question: 'Co oznacza wysoka zmienność (volatility) akcji?',
        options: [
          'Że spółka na pewno zbankrutuje.',
          'Że cena silnie i często się waha, co oznacza wyższe ryzyko.',
          'Że spółka wypłaca wysoką dywidendę.',
          'Że akcje są bardzo płynne i mają wąski spread.',
        ],
        correctIndex: 1,
        explanation: 'Zmienność mierzy skalę wahań ceny. Wysoka zmienność oznacza możliwość szybkich zysków, ale też szybkich i dotkliwych strat.',
      },
    ],
  },

  /* ==========================================================================
   * POZIOM: ŚREDNIOZAAWANSOWANY
   * ======================================================================= */
  {
    id: 'analiza-techniczna',
    level: 'intermediate',
    title: 'Analiza techniczna: wykresy i trendy',
    description: 'Naucz się czytać świece japońskie, wyznaczać linie trendu oraz poziomy wsparcia i oporu.',
    icon: 'candlestick',
    reward: 5000,
    lessons: [
      {
        id: 'wykresy-swiecowe',
        title: 'Rodzaje wykresów i świece japońskie',
        minutes: 5,
        blocks: [
          p('**Analiza techniczna** zakłada, że historia notowań – cena i wolumen – zawiera informacje pomocne w przewidywaniu przyszłych ruchów. Podstawowym narzędziem analityka technicznego jest wykres.'),
          list([
            '**Wykres liniowy** – łączy ceny zamknięcia kolejnych okresów. Przejrzysty, dobry do oceny ogólnego kierunku.',
            '**Wykres świecowy** – dla każdego okresu pokazuje cztery ceny: otwarcia, maksimum, minimum i zamknięcia (OHLC). Daje znacznie więcej informacji.',
          ]),
          h('Budowa świecy japońskiej'),
          terms([
            ['Korpus', 'Prostokąt między ceną otwarcia a ceną zamknięcia.'],
            ['Świeca wzrostowa (zielona)', 'Cena zamknięcia jest wyższa od ceny otwarcia – kupujący przeważali.'],
            ['Świeca spadkowa (czerwona)', 'Cena zamknięcia jest niższa od ceny otwarcia – przeważali sprzedający.'],
            ['Knoty (cienie)', 'Cienkie linie nad i pod korpusem pokazujące maksimum i minimum okresu.'],
          ]),
          example('Długi dolny knot przy małym korpusie (tzw. młot) po serii spadków oznacza, że sprzedający zepchnęli cenę nisko, ale kupujący zdołali ją odkupić. Może to zapowiadać odwrócenie trendu spadkowego.'),
          tip('Na stronie Handel przełączaj interwały 1D, 1W, 1M i 1Y. Ta sama spółka może być w trendzie spadkowym na wykresie dziennym, a jednocześnie w silnym trendzie wzrostowym na wykresie rocznym. Zawsze zaczynaj analizę od dłuższego interwału.', 'W symulatorze'),
        ],
      },
      {
        id: 'trendy',
        title: 'Trendy i linie trendu',
        minutes: 5,
        blocks: [
          p('Jedna z najstarszych zasad giełdowych brzmi: **„trend jest Twoim przyjacielem”**. Zamiast walczyć z rynkiem, lepiej podążać za dominującym kierunkiem ruchu cen.'),
          list([
            '**Trend wzrostowy** – każdy kolejny szczyt i każdy kolejny dołek są wyżej od poprzednich (wyższe szczyty i wyższe dołki).',
            '**Trend spadkowy** – kolejne szczyty i dołki są coraz niżej.',
            '**Trend boczny (konsolidacja)** – cena porusza się w poziomym przedziale bez wyraźnego kierunku.',
          ]),
          h('Jak wyznaczyć linię trendu?'),
          list(
            [
              'W trendzie wzrostowym połącz co najmniej dwa kolejne, coraz wyższe dołki.',
              'W trendzie spadkowym połącz co najmniej dwa kolejne, coraz niższe szczyty.',
              'Im więcej razy cena dotknęła linii i od niej odbiła, tym linia jest ważniejsza.',
              'Przedłuż linię w prawo – wskaże, gdzie w przyszłości może pojawić się reakcja ceny.',
            ],
            true,
          ),
          warning('Przebicie linii trendu nie oznacza automatycznie odwrócenia trendu. Szukaj potwierdzenia: zamknięcia świecy po drugiej stronie linii, wzrostu wolumenu lub zmiany struktury szczytów i dołków.'),
          tip('Kupowanie w trendzie wzrostowym w pobliżu linii trendu daje zwykle lepszy stosunek zysku do ryzyka niż kupowanie po gwałtownym wybiciu na nowe szczyty.'),
        ],
      },
      {
        id: 'wsparcie-opor',
        title: 'Poziomy wsparcia i oporu',
        minutes: 5,
        blocks: [
          p('**Wsparcie** to poziom cenowy, na którym popyt jest na tyle silny, że powstrzymuje dalsze spadki. **Opór** to poziom, na którym podaż zatrzymuje wzrosty. Te strefy powstają, ponieważ inwestorzy pamiętają ceny, przy których wcześniej zawierali transakcje.'),
          h('Jak je rozpoznać?'),
          list([
            'Miejsca, w których cena wielokrotnie zawracała w przeszłości.',
            'Okrągłe liczby psychologiczne, np. 100 USD czy 200 USD.',
            'Historyczne szczyty i dołki.',
            'Obszary, w których przez dłuższy czas odbywał się duży obrót.',
          ]),
          h('Zamiana ról'),
          p('Gdy cena zdecydowanie przebije opór, ten często staje się nowym wsparciem – i odwrotnie. Inwestorzy, którzy żałowali, że nie kupili przy oporze, chętnie kupują przy powrocie ceny do tego poziomu.'),
          example('Akcje przez trzy miesiące nie mogły przebić 150 USD. Po dobrym raporcie kwartalnym wybiły do 165 USD, a następnie cofnęły się do 151 USD i odbiły w górę. Dawny opór przy 150 USD zadziałał jako nowe wsparcie.'),
          tip('Poziomy wsparcia to naturalne miejsca na ustawienie zlecenia Stop-Loss – tuż poniżej wsparcia, a nie dokładnie na nim, bo tam zwykle gromadzi się najwięcej zleceń.'),
        ],
      },
      {
        id: 'wolumen',
        title: 'Wolumen jako potwierdzenie ruchu',
        minutes: 3,
        blocks: [
          p('**Wolumen** to liczba akcji, które zmieniły właściciela w danym okresie. Pokazuje, ile „paliwa” stoi za ruchem ceny.'),
          list([
            'Wzrost ceny przy rosnącym wolumenie – silny ruch, potwierdzony przez wielu uczestników rynku.',
            'Wzrost ceny przy malejącym wolumenie – ruch może tracić siłę.',
            'Wybicie z konsolidacji przy wysokim wolumenie jest bardziej wiarygodne niż przy niskim.',
            'Bardzo wysoki wolumen po długim spadku może oznaczać kapitulację sprzedających i bliski dołek.',
          ]),
          warning('Wolumen nie mówi, kto wygrał – kupujący czy sprzedający. Zawsze interpretuj go razem z kierunkiem ruchu ceny.'),
        ],
      },
    ],
    quiz: [
      {
        id: 'q1',
        question: 'Co oznacza zielona (wzrostowa) świeca japońska?',
        options: [
          'Cena zamknięcia była wyższa od ceny otwarcia.',
          'Wolumen był wyższy niż dzień wcześniej.',
          'Cena osiągnęła nowe historyczne maksimum.',
          'Spółka opublikowała dobry raport.',
        ],
        correctIndex: 0,
        explanation: 'Kolor świecy zależy wyłącznie od relacji ceny zamknięcia do ceny otwarcia w danym okresie.',
      },
      {
        id: 'q2',
        question: 'Jak definiujemy trend wzrostowy?',
        options: [
          'Cena rośnie trzy dni z rzędu.',
          'Kolejne szczyty i dołki są coraz wyższe.',
          'Spółka ma rosnące przychody.',
          'Cena jest powyżej 100 USD.',
        ],
        correctIndex: 1,
        explanation: 'Trend wzrostowy to sekwencja wyższych szczytów i wyższych dołków. Kilka zielonych świec z rzędu nie wystarcza, aby mówić o trendzie.',
      },
      {
        id: 'q3',
        question: 'Cena wybiła się powyżej oporu na poziomie 80 USD, a następnie wróciła do 80 USD. Czego zgodnie z zasadą zamiany ról można się spodziewać?',
        options: [
          'Że poziom 80 USD przestał mieć jakiekolwiek znaczenie.',
          'Że poziom 80 USD może teraz zadziałać jako wsparcie.',
          'Że cena na pewno spadnie poniżej 70 USD.',
          'Że giełda zawiesi notowania spółki.',
        ],
        correctIndex: 1,
        explanation: 'Przebity opór często staje się wsparciem, ponieważ inwestorzy, którzy przegapili wybicie, chętnie kupują przy powrocie do tego poziomu.',
      },
      {
        id: 'q4',
        question: 'Gdzie rozsądnie umieścić Stop-Loss przy zakupie akcji tuż nad silnym wsparciem?',
        options: [
          'Dokładnie na poziomie wsparcia.',
          'Nieco poniżej poziomu wsparcia.',
          'Powyżej ceny zakupu.',
          'Stop-Loss nie jest potrzebny przy silnym wsparciu.',
        ],
        correctIndex: 1,
        explanation: 'Ustawienie Stop-Lossa nieco poniżej wsparcia chroni przed przypadkowym wybiciem z pozycji, a jednocześnie zamyka ją, gdy wsparcie zostanie naprawdę przełamane.',
      },
      {
        id: 'q5',
        question: 'Które wybicie z konsolidacji jest najbardziej wiarygodne?',
        options: [
          'Wybicie przy bardzo niskim wolumenie.',
          'Wybicie przy wysokim, rosnącym wolumenie.',
          'Wybicie w ostatniej minucie sesji przy braku obrotu.',
          'Wolumen nie ma znaczenia przy wybiciach.',
        ],
        correctIndex: 1,
        explanation: 'Wysoki wolumen pokazuje, że za ruchem stoi wielu uczestników rynku, co zwiększa szansę na kontynuację.',
      },
    ],
  },

  {
    id: 'analiza-fundamentalna',
    level: 'intermediate',
    title: 'Analiza fundamentalna',
    description: 'Oceniaj wartość spółek za pomocą wskaźnika C/Z, analizuj dywidendy i czytaj raporty kwartalne.',
    icon: 'file-text',
    reward: 5000,
    lessons: [
      {
        id: 'wartosc-spolki',
        title: 'Cena a wartość spółki',
        minutes: 4,
        blocks: [
          p('Analityk fundamentalny pyta: **„Ile ta firma jest naprawdę warta?”**. Jeśli wartość wewnętrzna spółki jest wyższa od jej ceny rynkowej, akcje mogą być niedowartościowane. Jeśli niższa – przewartościowane.'),
          p('Wartość spółki zależy przede wszystkim od zysków, które wygeneruje w przyszłości, oraz od tego, jak pewne są te zyski. Dlatego analiza fundamentalna skupia się na danych finansowych, pozycji konkurencyjnej i jakości zarządu.'),
          h('Trzy podstawowe sprawozdania finansowe'),
          terms([
            ['Rachunek zysków i strat', 'Pokazuje przychody, koszty i zysk netto w danym okresie.'],
            ['Bilans', 'Przedstawia majątek spółki (aktywa) oraz źródła jego finansowania (kapitał własny i zobowiązania).'],
            ['Rachunek przepływów pieniężnych', 'Pokazuje, ile gotówki faktycznie wpłynęło do firmy i z niej wypłynęło.'],
          ]),
          tip('Zysk księgowy można „upiększać”, gotówkę znacznie trudniej. Jeśli spółka od lat raportuje zyski, ale ma ujemne przepływy z działalności operacyjnej, to sygnał ostrzegawczy.'),
        ],
      },
      {
        id: 'wskaznik-cz',
        title: 'Wskaźnik C/Z (P/E Ratio)',
        minutes: 5,
        blocks: [
          p('**Wskaźnik cena/zysk (C/Z)**, w języku angielskim **P/E (Price to Earnings)**, to najpopularniejsza miara wyceny akcji. Pokazuje, ile inwestorzy płacą za 1 dolara rocznego zysku spółki.'),
          formula('C/Z = cena akcji ÷ zysk netto na jedną akcję (EPS)'),
          example('Akcje kosztują 120 USD, a zysk na akcję za ostatnie 12 miesięcy wyniósł 6 USD. C/Z = 120 ÷ 6 = 20. Inwestorzy płacą 20 USD za każdego dolara rocznego zysku – przy niezmiennych zyskach „zwrot” z ceny zakupu nastąpiłby po 20 latach.'),
          h('Jak interpretować C/Z?'),
          list([
            '**Niskie C/Z** może oznaczać okazję – albo problemy spółki, których rynek się obawia.',
            '**Wysokie C/Z** może oznaczać przewartościowanie – albo oczekiwanie szybkiego wzrostu zysków.',
            'C/Z porównuj **w obrębie tego samego sektora**: spółki technologiczne zwykle mają wyższe C/Z niż banki czy firmy energetyczne.',
            'Ujemny zysk sprawia, że wskaźnik C/Z traci sens – wtedy sięga się po inne miary, np. cena/sprzedaż (C/S).',
          ]),
          terms([
            ['EPS', 'Zysk netto na jedną akcję (Earnings Per Share).'],
            ['C/Z historyczne (TTM)', 'Liczone na podstawie zysków z ostatnich 12 miesięcy.'],
            ['C/Z prognozowane (forward)', 'Liczone na podstawie przewidywanych zysków na kolejne 12 miesięcy.'],
          ]),
          warning('Żaden pojedynczy wskaźnik nie wystarczy do oceny spółki. C/Z jest punktem wyjścia do dalszej analizy, a nie gotowym sygnałem kupna lub sprzedaży.'),
        ],
      },
      {
        id: 'dywidendy',
        title: 'Dywidendy',
        minutes: 4,
        blocks: [
          p('**Dywidenda** to część zysku spółki wypłacana akcjonariuszom, najczęściej w gotówce. Spółki amerykańskie zwykle wypłacają dywidendy co kwartał, a polskie – raz w roku.'),
          formula('Stopa dywidendy = roczna dywidenda na akcję ÷ cena akcji × 100%'),
          example('Spółka wypłaca 4 USD dywidendy rocznie na akcję, a akcje kosztują 100 USD. Stopa dywidendy wynosi 4%.'),
          h('Ważne daty'),
          terms([
            ['Dzień ogłoszenia', 'Spółka informuje o wysokości i terminach wypłaty dywidendy.'],
            ['Dzień odcięcia (ex-dividend)', 'Od tego dnia nowy nabywca akcji nie otrzyma już bieżącej dywidendy. Kurs zwykle spada mniej więcej o wartość dywidendy.'],
            ['Dzień wypłaty', 'Pieniądze trafiają na rachunki uprawnionych akcjonariuszy.'],
          ]),
          h('Wskaźnik wypłaty'),
          p('**Wskaźnik wypłaty dywidendy** (ang. payout ratio) to część zysku przeznaczana na dywidendę. Wartość powyżej 100% oznacza, że spółka wypłaca więcej, niż zarabia, co w dłuższym terminie jest trudne do utrzymania.'),
          warning('Bardzo wysoka stopa dywidendy często jest pułapką: może wynikać z gwałtownego spadku kursu, który sygnalizuje kłopoty i ryzyko obniżenia dywidendy.'),
          tip('Polski inwestor płaci od dywidend 19% podatku (tzw. podatek Belki). Przy spółkach z USA część podatku pobierana jest u źródła, a pozostałą część rozlicza się w Polsce.'),
        ],
      },
      {
        id: 'raporty-kwartalne',
        title: 'Raporty kwartalne',
        minutes: 5,
        blocks: [
          p('Spółki giełdowe regularnie publikują wyniki finansowe. W USA są to raporty kwartalne **10-Q** i raport roczny **10-K**. Okres publikacji wyników (ang. earnings season) to czas największych emocji i gwałtownych ruchów cen.'),
          h('Na co patrzą inwestorzy?'),
          list([
            '**Przychody** – czy sprzedaż rośnie i w jakim tempie (rok do roku).',
            '**EPS** – zysk na akcję w porównaniu z oczekiwaniami analityków (konsensusem).',
            '**Marże** – jaka część przychodów zostaje w firmie jako zysk.',
            '**Prognozy (guidance)** – czego zarząd spodziewa się w kolejnych kwartałach. Często są ważniejsze niż same wyniki.',
            '**Przepływy pieniężne i zadłużenie** – czy firma generuje gotówkę i jak finansuje rozwój.',
          ]),
          example('Spółka podała zysk na akcję 2,10 USD przy konsensusie 2,00 USD, ale obniżyła prognozę przychodów na kolejny kwartał. Mimo „pobicia oczekiwań” kurs spadł o 8%. Rynek wycenia przyszłość, a nie przeszłość.'),
          tip('Przed publikacją raportu ryzyko gwałtownej luki cenowej jest wyjątkowo wysokie. Rozważ zmniejszenie pozycji przed wynikami, jeśli nie jesteś gotów na ruch rzędu 10% w dowolną stronę.'),
        ],
      },
    ],
    quiz: [
      {
        id: 'q1',
        question: 'Akcje kosztują 90 USD, a zysk na akcję (EPS) wynosi 4,50 USD. Ile wynosi wskaźnik C/Z?',
        options: ['4,5', '20', '40,5', '85,5'],
        correctIndex: 1,
        explanation: 'C/Z = cena ÷ EPS = 90 ÷ 4,50 = 20.',
      },
      {
        id: 'q2',
        question: 'Dlaczego wskaźnik C/Z najlepiej porównywać w obrębie jednego sektora?',
        options: [
          'Bo spółki z różnych sektorów mają odmienne tempo wzrostu i typowe poziomy wyceny.',
          'Bo C/Z jest liczony inaczej w każdym sektorze.',
          'Bo przepisy zabraniają porównań między sektorami.',
          'Bo C/Z ma znaczenie tylko dla spółek technologicznych.',
        ],
        correctIndex: 0,
        explanation: 'Spółki technologiczne o szybkim wzroście mają zwykle wyższe C/Z niż dojrzałe firmy z sektorów takich jak bankowość czy energetyka.',
      },
      {
        id: 'q3',
        question: 'Spółka wypłaca 3 USD dywidendy rocznie, a jej akcje kosztują 60 USD. Ile wynosi stopa dywidendy?',
        options: ['3%', '5%', '20%', '0,5%'],
        correctIndex: 1,
        explanation: 'Stopa dywidendy = 3 ÷ 60 × 100% = 5%.',
      },
      {
        id: 'q4',
        question: 'Co zwykle dzieje się z kursem akcji w dniu odcięcia dywidendy?',
        options: [
          'Kurs rośnie o wartość dywidendy.',
          'Kurs spada mniej więcej o wartość dywidendy.',
          'Notowania są zawieszone.',
          'Kurs nie może się zmienić tego dnia.',
        ],
        correctIndex: 1,
        explanation: 'Wartość dywidendy „opuszcza” spółkę, więc cena akcji zwykle dostosowuje się w dół mniej więcej o jej wysokość.',
      },
      {
        id: 'q5',
        question: 'Spółka pobiła oczekiwania co do zysku, ale obniżyła prognozy na kolejne kwartały. Jaka reakcja rynku jest najbardziej prawdopodobna?',
        options: [
          'Silny wzrost, bo liczy się tylko bieżący zysk.',
          'Brak reakcji, bo prognozy nie mają znaczenia.',
          'Spadek kursu, bo rynek wycenia przede wszystkim przyszłe wyniki.',
          'Automatyczne podwyższenie dywidendy.',
        ],
        correctIndex: 2,
        explanation: 'Inwestorzy kupują przyszłość spółki. Słabsze prognozy często ważą więcej niż dobre wyniki za miniony kwartał.',
      },
    ],
  },

  /* ==========================================================================
   * POZIOM: ZAAWANSOWANY
   * ======================================================================= */
  {
    id: 'wskazniki-rsi-macd',
    level: 'advanced',
    title: 'Wskaźniki techniczne: RSI i MACD',
    description: 'Opanuj dwa najpopularniejsze wskaźniki analizy technicznej i naucz się unikać ich typowych pułapek.',
    icon: 'activity',
    reward: 7500,
    lessons: [
      {
        id: 'rsi',
        title: 'Oscylator RSI',
        minutes: 6,
        blocks: [
          p('**RSI (Relative Strength Index – wskaźnik siły względnej)** opracował J. Welles Wilder w 1978 roku. To oscylator przyjmujący wartości od 0 do 100, który mierzy tempo i skalę ostatnich zmian ceny. Standardowo liczony jest z 14 okresów.'),
          formula('RSI = 100 − 100 ÷ (1 + RS), gdzie RS = średni wzrost ÷ średni spadek z ostatnich 14 okresów'),
          h('Klasyczna interpretacja'),
          list([
            '**RSI powyżej 70** – rynek jest wykupiony; wzrosty mogły być zbyt szybkie, a ryzyko korekty rośnie.',
            '**RSI poniżej 30** – rynek jest wyprzedany; spadki mogły być przesadzone i możliwe jest odbicie.',
            '**Okolice 50** – równowaga sił. Przebicie 50 od dołu bywa traktowane jako potwierdzenie przewagi kupujących.',
          ]),
          h('Dywergencje'),
          p('Bardzo cennym sygnałem jest **dywergencja**, czyli rozbieżność między ceną a wskaźnikiem. Jeśli cena tworzy nowy, wyższy szczyt, a RSI – szczyt niższy niż poprzednio, impet wzrostów słabnie (dywergencja niedźwiedzia). Analogicznie niższy dołek ceny przy wyższym dołku RSI to dywergencja bycza.'),
          warning('W silnym trendzie wzrostowym RSI potrafi tygodniami utrzymywać się powyżej 70. Sprzedawanie tylko dlatego, że wskaźnik „jest wykupiony”, to jeden z najdroższych błędów analizy technicznej.'),
          tip('W trendzie wzrostowym traktuj spadki RSI w okolice 40–50 jako potencjalne okazje do zakupu, a nie odczyty powyżej 70 jako sygnały sprzedaży.'),
        ],
      },
      {
        id: 'macd',
        title: 'MACD – zbieżność i rozbieżność średnich',
        minutes: 6,
        blocks: [
          p('**MACD (Moving Average Convergence Divergence)** stworzył Gerald Appel pod koniec lat 70. Wskaźnik bada relację między dwiema wykładniczymi średnimi kroczącymi (EMA) i pomaga ocenić zarówno kierunek trendu, jak i jego dynamikę.'),
          terms([
            ['Linia MACD', 'Różnica między 12-okresową a 26-okresową średnią EMA.'],
            ['Linia sygnałowa', '9-okresowa średnia EMA z linii MACD.'],
            ['Histogram', 'Różnica między linią MACD a linią sygnałową; pokazuje, czy impet rośnie, czy słabnie.'],
          ]),
          formula('MACD = EMA(12) − EMA(26)     Sygnał = EMA(9) z MACD     Histogram = MACD − Sygnał'),
          h('Najważniejsze sygnały'),
          list([
            '**Przecięcie linii sygnałowej od dołu** – sygnał kupna (impet wzrostowy przyspiesza).',
            '**Przecięcie linii sygnałowej od góry** – sygnał sprzedaży.',
            '**Przecięcie linii zera** – średnia krótsza przecina dłuższą; potwierdza zmianę trendu.',
            '**Malejący histogram** przy rosnącej cenie – ostrzeżenie, że wzrosty tracą siłę.',
          ]),
          warning('MACD bazuje na średnich kroczących, więc jest wskaźnikiem opóźnionym. W trendzie bocznym generuje wiele fałszywych sygnałów – przecięcia linii pojawiają się wtedy co kilka dni i niewiele znaczą.'),
        ],
      },
      {
        id: 'laczenie-sygnalow',
        title: 'Łączenie sygnałów i typowe pułapki',
        minutes: 5,
        blocks: [
          p('Żaden wskaźnik nie działa w każdych warunkach. Profesjonaliści szukają **konfluencji**, czyli sytuacji, w której kilka niezależnych sygnałów wskazuje ten sam kierunek.'),
          example('Cena w długoterminowym trendzie wzrostowym cofa się do linii trendu i poziomu wsparcia przy 100 USD. RSI spada do 38 i zaczyna rosnąć, a MACD przecina linię sygnałową od dołu przy rosnącym wolumenie. Cztery niezależne argumenty wskazują ten sam kierunek – to znacznie mocniejsza podstawa do decyzji niż pojedynczy sygnał.'),
          h('Pułapki, których należy unikać'),
          list([
            '**Nadmiar wskaźników** – RSI, stochastyk i CCI mierzą podobne zjawisko. Pięć oscylatorów to nie pięć potwierdzeń, lecz jedno powtórzone pięć razy.',
            '**Optymalizacja pod przeszłość** – parametry dopasowane idealnie do historii rzadko działają w przyszłości.',
            '**Ignorowanie kontekstu** – ten sam sygnał ma inne znaczenie w trendzie i w konsolidacji.',
            '**Brak planu wyjścia** – sygnał wejścia bez określonego Stop-Lossa i celu to hazard, a nie strategia.',
          ]),
          tip('Łącz wskaźnik trendu (np. MACD lub średnie kroczące) z oscylatorem (np. RSI) oraz z analizą wsparć i oporów. Tak zbudowany zestaw jest prosty, a jednocześnie wszechstronny.'),
        ],
      },
    ],
    quiz: [
      {
        id: 'q1',
        question: 'Jaki odczyt RSI tradycyjnie wskazuje na wykupienie rynku?',
        options: ['Poniżej 30', 'Dokładnie 50', 'Powyżej 70', 'Ujemny'],
        correctIndex: 2,
        explanation: 'RSI powyżej 70 sygnalizuje wykupienie, a poniżej 30 – wyprzedanie. RSI przyjmuje wartości od 0 do 100, więc nie może być ujemny.',
      },
      {
        id: 'q2',
        question: 'Cena tworzy wyższy szczyt, a RSI tworzy niższy szczyt niż poprzednio. Jak nazywa się taka sytuacja?',
        options: ['Dywergencja niedźwiedzia', 'Dywergencja bycza', 'Złoty krzyż', 'Konsolidacja'],
        correctIndex: 0,
        explanation: 'Rozbieżność, w której cena rośnie, a wskaźnik słabnie, to dywergencja niedźwiedzia – sygnał wyczerpywania się impetu wzrostowego.',
      },
      {
        id: 'q3',
        question: 'Jak obliczana jest linia MACD w ustawieniach standardowych?',
        options: [
          'Jako średnia z 14 ostatnich zmian ceny.',
          'Jako różnica między EMA(12) a EMA(26).',
          'Jako 9-okresowa średnia z ceny zamknięcia.',
          'Jako stosunek wolumenu do ceny.',
        ],
        correctIndex: 1,
        explanation: 'Linia MACD to różnica 12- i 26-okresowej wykładniczej średniej kroczącej. 9-okresowa EMA z MACD to linia sygnałowa.',
      },
      {
        id: 'q4',
        question: 'W jakich warunkach rynkowych MACD generuje najwięcej fałszywych sygnałów?',
        options: ['W silnym trendzie wzrostowym', 'W silnym trendzie spadkowym', 'W trendzie bocznym (konsolidacji)', 'Podczas publikacji dywidendy'],
        correctIndex: 2,
        explanation: 'MACD jest wskaźnikiem trendu. Gdy cena porusza się w bok, linie często się przecinają, generując sygnały bez znaczenia.',
      },
      {
        id: 'q5',
        question: 'Dlaczego używanie jednocześnie RSI, stochastyka i CCI nie daje trzech niezależnych potwierdzeń?',
        options: [
          'Bo te wskaźniki nie działają na rynku akcji.',
          'Bo wszystkie są oscylatorami mierzącymi bardzo podobne zjawisko – dynamikę ceny.',
          'Bo można ich używać tylko na wykresach tygodniowych.',
          'Bo wzajemnie się wykluczają.',
        ],
        correctIndex: 1,
        explanation: 'Oscylatory dynamiki korzystają z tych samych danych i dają zbliżone sygnały. Prawdziwa konfluencja wymaga różnych typów analizy, np. trendu, oscylatora i poziomów cenowych.',
      },
    ],
  },

  {
    id: 'psychologia-ryzyko',
    level: 'advanced',
    title: 'Zarządzanie ryzykiem i psychologia',
    description: 'Wyznaczaj wielkość pozycji, planuj stosunek zysku do ryzyka i panuj nad emocjami, które niszczą portfele.',
    icon: 'brain',
    reward: 7500,
    lessons: [
      {
        id: 'wielkosc-pozycji',
        title: 'Wielkość pozycji i reguła 1–2%',
        minutes: 6,
        blocks: [
          p('Profesjonalni traderzy nie zaczynają od pytania „ile akcji kupić?”, lecz „ile mogę stracić na tej transakcji?”. Najpopularniejsza odpowiedź to **reguła 1–2%**: na pojedynczej transakcji ryzykujesz nie więcej niż 1–2% całego kapitału.'),
          formula('Liczba akcji = (kapitał × % ryzyka) ÷ (cena wejścia − poziom Stop-Loss)', 'Wielkość pozycji'),
          example('Masz 100 000 USD i ryzykujesz 1%, czyli 1 000 USD. Kupujesz akcje po 50 USD, a Stop-Loss ustawiasz na 47,50 USD. Ryzyko na jedną akcję wynosi 2,50 USD, więc możesz kupić 1 000 ÷ 2,50 = 400 akcji o wartości 20 000 USD. Jeśli Stop-Loss zadziała, stracisz około 1 000 USD, czyli 1% kapitału.'),
          h('Dlaczego to działa?'),
          p('Przy ryzyku 1% na transakcję nawet seria 10 strat z rzędu zmniejsza kapitał tylko o około 10%. Przy ryzyku 10% na transakcję ta sama seria zniszczyłaby ponad 65% portfela – a odrobienie takiej straty wymaga zysku przekraczającego 180%.'),
          tip('Zwróć uwagę, że wielkość pozycji zależy od odległości Stop-Lossa. Szerszy Stop-Loss oznacza mniej akcji, węższy – więcej. Ryzyko w dolarach pozostaje stałe.'),
          warning('Reguła 1–2% dotyczy kwoty, którą możesz stracić, a nie wartości pozycji. Pozycja o wartości 20% portfela może oznaczać ryzyko zaledwie 1%, jeśli Stop-Loss jest blisko ceny wejścia.'),
        ],
      },
      {
        id: 'zysk-do-ryzyka',
        title: 'Stosunek zysku do ryzyka',
        minutes: 5,
        blocks: [
          p('**Stosunek zysku do ryzyka** (ang. risk/reward, R:R) porównuje potencjalny zysk z potencjalną stratą. Jeśli ryzykujesz 5 USD na akcję, a Twój cel to zysk 15 USD, stosunek wynosi 1:3.'),
          formula('Minimalna skuteczność = ryzyko ÷ (ryzyko + zysk)', 'Próg rentowności'),
          list([
            'Przy R:R 1:1 musisz mieć rację w ponad 50% transakcji, aby zarabiać.',
            'Przy R:R 1:2 wystarczy skuteczność powyżej 33,3%.',
            'Przy R:R 1:3 wystarczy skuteczność powyżej 25%.',
          ]),
          example('Trader zawiera 10 transakcji z R:R 1:3 i ryzykiem 1 000 USD każda. Wygrywa tylko 4 z nich: 4 × 3 000 USD = 12 000 USD zysku i 6 × 1 000 USD = 6 000 USD straty. Mimo że mylił się w 60% przypadków, zarobił na czysto 6 000 USD.'),
          tip('Zanim otworzysz pozycję, zapisz cenę wejścia, Stop-Loss i cel. Jeśli stosunek zysku do ryzyka jest gorszy niż 1:2, często lepiej odpuścić transakcję i poczekać na lepszą okazję.'),
        ],
      },
      {
        id: 'emocje',
        title: 'Emocje inwestora: strach i chciwość',
        minutes: 6,
        blocks: [
          p('Rynek jest areną, na której ścierają się dwie emocje: **strach** i **chciwość**. Badania z zakresu finansów behawioralnych, m.in. prace Daniela Kahnemana i Amosa Tversky’ego, pokazują, że ludzie systematycznie podejmują nieracjonalne decyzje finansowe.'),
          h('Najczęstsze pułapki psychologiczne'),
          terms([
            ['Awersja do strat', 'Strata boli mniej więcej dwa razy bardziej, niż cieszy zysk tej samej wielkości. Dlatego inwestorzy kurczowo trzymają stratne pozycje.'],
            ['Efekt dyspozycji', 'Skłonność do zbyt wczesnego sprzedawania zyskownych akcji i zbyt długiego trzymania stratnych.'],
            ['FOMO (Fear of Missing Out)', 'Strach przed przegapieniem okazji, który prowadzi do kupowania po gwałtownych wzrostach, często na samym szczycie.'],
            ['Nadmierna pewność siebie', 'Po serii udanych transakcji inwestor przecenia swoje umiejętności i zwiększa ryzyko.'],
            ['Efekt potwierdzenia', 'Szukanie wyłącznie informacji, które potwierdzają już podjętą decyzję, i ignorowanie sygnałów ostrzegawczych.'],
            ['Chęć odegrania się', 'Zawieranie impulsywnych, zbyt dużych transakcji po stracie, aby „szybko się odkuć”.'],
          ]),
          h('Jak panować nad emocjami?'),
          list([
            'Podejmuj decyzje przed otwarciem pozycji, gdy jesteś spokojny – a potem realizuj plan.',
            'Ryzykuj kwoty, których utrata nie odbierze Ci snu.',
            'Po serii strat zrób przerwę lub zmniejsz wielkość pozycji.',
            'Nie sprawdzaj notowań co minutę, jeśli inwestujesz długoterminowo.',
          ]),
          warning('Najgroźniejszym przeciwnikiem inwestora rzadko jest rynek. Znacznie częściej jest nim on sam.'),
        ],
      },
      {
        id: 'plan-i-dziennik',
        title: 'Plan transakcyjny i dziennik inwestora',
        minutes: 4,
        blocks: [
          p('Różnica między hazardem a inwestowaniem polega na posiadaniu **przewagi** i **planu**. Plan transakcyjny to zestaw zasad, które z góry określają, co, kiedy i za ile kupujesz oraz kiedy wychodzisz z pozycji.'),
          h('Elementy dobrego planu'),
          list(
            [
              'Warunki wejścia – jakie sygnały muszą wystąpić.',
              'Poziom Stop-Loss i maksymalne ryzyko w dolarach.',
              'Cel zysku lub zasady przesuwania kroczącego Stop-Lossa.',
              'Wielkość pozycji wynikająca z reguły 1–2%.',
              'Maksymalny łączny udział jednego sektora w portfelu.',
            ],
            true,
          ),
          h('Dziennik inwestora'),
          p('Zapisuj każdą transakcję: powód wejścia, emocje, wynik i wnioski. Po kilkudziesięciu transakcjach zobaczysz wzorce, których nie dostrzeżesz w inny sposób – np. że najwięcej tracisz w piątki albo po trzech zyskach z rzędu.'),
          tip('Historia transakcji w symulatorze to gotowy materiał do dziennika. Przeglądaj ją co tydzień i zapytaj siebie: „Które decyzje wynikały z planu, a które z emocji?”.', 'W symulatorze'),
          p('Gratulacje – dotarłeś do ostatniej lekcji kursu! Najlepszym sposobem na utrwalenie wiedzy jest teraz praktyka w symulatorze: bez prawdziwego ryzyka, ale z pełnym zestawem decyzji, jakie podejmuje prawdziwy inwestor.'),
        ],
      },
    ],
    quiz: [
      {
        id: 'q1',
        question: 'Masz 50 000 USD kapitału i ryzykujesz 2% na transakcję. Cena wejścia to 40 USD, a Stop-Loss – 38 USD. Ile akcji możesz kupić?',
        options: ['250', '500', '1 000', '1 250'],
        correctIndex: 1,
        explanation: 'Ryzyko = 2% × 50 000 USD = 1 000 USD. Ryzyko na akcję = 40 − 38 = 2 USD. Liczba akcji = 1 000 ÷ 2 = 500.',
      },
      {
        id: 'q2',
        question: 'Jaką minimalną skuteczność musi mieć strategia o stosunku zysku do ryzyka 1:2, aby nie przynosić strat?',
        options: ['Ponad 25%', 'Ponad 33,3%', 'Ponad 50%', 'Ponad 66,7%'],
        correctIndex: 1,
        explanation: 'Próg rentowności = ryzyko ÷ (ryzyko + zysk) = 1 ÷ (1 + 2) ≈ 33,3%.',
      },
      {
        id: 'q3',
        question: 'Na czym polega efekt dyspozycji?',
        options: [
          'Na trzymaniu wyłącznie gotówki.',
          'Na zbyt wczesnej sprzedaży zyskownych pozycji i zbyt długim trzymaniu stratnych.',
          'Na inwestowaniu tylko w spółki dywidendowe.',
          'Na automatycznym reinwestowaniu zysków.',
        ],
        correctIndex: 1,
        explanation: 'Efekt dyspozycji to skłonność do „realizowania zysków” zbyt wcześnie i unikania realizacji strat, co w praktyce obcina zyski i pozwala rosnąć stratom.',
      },
      {
        id: 'q4',
        question: 'Zawarłeś trzy stratne transakcje z rzędu. Które zachowanie jest najbardziej rozsądne?',
        options: [
          'Podwoić wielkość kolejnej pozycji, aby szybko odrobić straty.',
          'Usunąć wszystkie zlecenia Stop-Loss.',
          'Zrobić przerwę lub zmniejszyć wielkość pozycji i przeanalizować transakcje w dzienniku.',
          'Kupić spółkę, która najmocniej wzrosła w tym tygodniu.',
        ],
        correctIndex: 2,
        explanation: 'Chęć odegrania się prowadzi do impulsywnych decyzji. Przerwa i analiza błędów chronią kapitał i pozwalają wrócić do realizacji planu.',
      },
      {
        id: 'q5',
        question: 'Czym jest FOMO na rynku?',
        options: [
          'Strategią kupowania akcji w dniu odcięcia dywidendy.',
          'Strachem przed przegapieniem okazji, który skłania do kupowania po gwałtownych wzrostach.',
          'Typem zlecenia z limitem ceny.',
          'Wskaźnikiem mierzącym wolumen obrotu.',
        ],
        correctIndex: 1,
        explanation: 'FOMO (Fear of Missing Out) powoduje, że inwestorzy kupują pod wpływem emocji, często w pobliżu lokalnych szczytów.',
      },
    ],
  },
];

/** Próg zaliczenia quizu (odsetek poprawnych odpowiedzi). */
export const QUIZ_PASS_THRESHOLD = 0.8;

/** Bonus za ukończenie całego kursu (USD). */
export const COURSE_COMPLETION_BONUS = 25_000;

export function getModule(id: string): CourseModule | undefined {
  return COURSE_MODULES.find((m) => m.id === id);
}

export function getModulesByLevel(level: CourseModule['level']): CourseModule[] {
  return COURSE_MODULES.filter((m) => m.level === level);
}

export const TOTAL_LESSONS = COURSE_MODULES.reduce((sum, m) => sum + m.lessons.length, 0);
