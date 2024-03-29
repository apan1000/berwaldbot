// http://berwaldhallen.ebiljett.nu/Home/tickets/1194/False
const images_url = 'http://www.csc.kth.se/~fberglun/exjobb/images/';
module.exports = {
    berwaldhallen: {
        about: [
            'Konserthuset Berwaldhallen, med Sveriges Radios Symfoniorkester och Radiokören, är en del av Sveriges Radio och en av landets viktigaste kulturinstitutioner med räckvidd långt utanför landets gränser.',

            'Berwaldhallen är hemmascen för de två ensemblerna Sveriges Radios Symfoniorkester och Radiokören, som båda tillhör de yppersta i Europa inom sina respektive fält.'+
            ' Genom turnéer och framträdanden världen över, har de även blivit viktiga ambassadörer för svensk musik och kultur utomlands.'+
            '\n\nÅrligen ges cirka 100 konserter -  i Berwaldhallen och på turnéer och varje sommar arrangeras Östersjöfestivalen här.'+
            ' Samtliga konserter sänds i Sveriges Radio, de flesta i P2, samt runtom och utanför Europa via EBU, European Broadcasting Union.',

            'Tack vare Radiokören och Radiosymfonikerna kan Sveriges Radio erbjuda sina lyssnare ett kvalitativt kulturutbud.'+
            '\nGenom direktsändning kan alla få tillgång till konstmusik av mycket hög kvalitet och musikupplevelser som annars skulle vara svåra att nå.'+
            '\n\nBerwaldhallen är även en efterfrågad konsertscen för externa arrangörer och utöver våra egna konserter och evenemang, äger årligen ett stort antal konserter, bolagsstämmor och andra evenemang, rum i Berwaldhallen.'
        ],
        image: images_url+'berwaldhallen.jpg',
        website_url: 'https://sverigesradio.se/berwaldhallen',
        history_url: 'https://sverigesradio.se/sida/artikel.aspx?programid=3991&artikel=5848173',
        spotify_url: 'http://open.spotify.com/user/berwaldhallen/playlist/0jNERhOXHnAJEEdvn7ARXO'
    },
    concert : {
        name: 'Solistprisvinnaren',
        image: images_url+'solistprisvinnaren.jpg',
        occasions: [
            {
                date:'2017-03-29',
                time: '18:00',
                url: 'http://berwaldhallen.ebiljett.nu/Home/tickets/1194/False',
                image: images_url+'solist_small.jpg'
            }, {
                date:'2017-03-30',
                time: '18:00',
                url: 'http://berwaldhallen.ebiljett.nu/Home/tickets/1195/False',
                image: images_url+'solist_small.jpg'
            }
        ],
        about: 'Den blygsamma fagotten blir ett enastående virtuost instrument i händerna på 2015 års solistprisvinnare och P2:s Artist in Residence, Sebastian Stevensson!'+
            '\n\nBernhard Crusells Concertino står i fokus men även Antonín Dvoráks lyriska och folkmusikinspirerade Symfoni nr. 8.'+
            '\n\nDirigerar gör det amerikanska stjärnskottet Karina Canellakis, en av dagens mest spännande unga dirigenter!'+
            '\n\nPresentatör: Tanja Orraryd'+
            '\nUngefärlig konserttid: 1 tim 10 min (ingen paus)'+
            '\nKonserten sänds fredag 12/5 i Sveriges Radios P2.'+
            '\n\nEfter onsdagskonserter BERWALDBONUS: TONSÄTTARINNOR',
        participants: [
            {
                name: 'Karina Canellakis',
                position: 'dirigent',
                image: images_url+'karina.jpg',
                website_url: 'http://karinacanellakis.com/',
                spotify_url: 'https://open.spotify.com/artist/11II2kGYW5NPw1xeNWses6',
                about: [
                    'New York-födda Karina Canellakis har vunnit internationell berömmelse för såväl sina tekniska som musikaliska kunskaper.'+
                    '\nVinnaren av 2016 års Sir Georg Solti Conducting Award har fått lysande kritik sedan 2014 då hon i sista minuten ryckte in som ersättare för Jaap van Zweden och dirigerade Dallas symfoniorkester i Sjostakovitjs åttonde symfoni.'+
                    '\n\nHon gjorde europeisk debut i juni förra året med Chamber Orchestra of Europe på Styriarte Festival i Graz och är åter inbjuden till Graz i juni i år för att dirigera Concentus Musicus Wien i fyra symfonier av Beethoven.',
                    
                    'Hon har varit biträdande dirigent för Dallas symfoniorkester två säsonger och då genomfört över 60 konserter.'+
                    '\n\nSäsongen 2016/17 debuterar Karina Kanellakis, utöver Sveriges Radios Symfoniorkester, bland annat med City of Birmingham Symphony Orchestra, Royal Scottish National Orchestra, Orchestre National de Lyon samt Trondheim, Kristiansand och Malmö symfoniorkestrar.'
                ]
            },
            {
                name: 'Sebastian Stevensson',
                position: 'fagott',
                image: images_url+'sebastian.jpg',
                website_url: 'http://www.csc.kth.se/~fberglun/exjobb/sebastian-stevensson/',
                about: [
                    'Sebastian Stevensson är 2016 års vinnare av Solistpriset som han mottog i Berwaldhallen i januari samma år.'+
                    '\n\nSebastian har studerat vid Kungliga Musikhögskolan i Stockholm och arbetat på Norska Operan och som solofagottist i Danmarks Radios Symfoniorkester där han sedan 2012 har en fast plats.'+
                    '\nUnder 2015 arbetade Sebastian som solofagottist i Münchner Philharmoniker under Valery Gergiev.',
                    
                    'Han har under kortare perioder arbetat som solofagottist med orkestrar som London Philharmonic Orchestra, City of Birmingham Symphony Orchestra, Kungliga Filharmonikerna, Philharmonia Orchestra London och Rotterdam Philharmonic.'+
                    '\nSebastian har även lett mästarkurser för musikhögskolestudenter i Stockholm och Mannheim.'+
                    '\nSebastian Stevensson är P2:s artist 2016/2017.'
                ]
            },
            {
                name: 'Sveriges Radios Symfoniorkester',
                position: 'orkester',
                image: images_url+'orkester.jpg',
                website_url: 'https://sverigesradio.se/sida/artikel.aspx?programid=3988&artikel=4507405',
                spotify_url: 'https://open.spotify.com/artist/0K6ufQj8JzIZPPkvZrEwJS',
                about: [
                    'Sveriges Radios Symfoniorkester är hela Sveriges orkester. Oavsett var i landet du bor kan du lyssna på orkesterns konserter i Sveriges Radio P2 i etern och på webben och flera av dem visas också i Sveriges Television.',

                    'Inför Radiosymfonikernas gästspel vid the BBC Proms 2014 blev Daniel Harding tillfrågad om varför de sticker ut ur mängden.'+
                    ' ”Orkestern har en otrolig ödmjukhet inför musiken och en underbar känsla för musikalisk fantasi och uppfinningsförmåga.”'+
                    '\n\nI en annan intervju sade Tomo Keller, en av orkesterns konsertmästare, att ”det är en ren glädje att spela med orkestern” och framhävde två unika drag: drivkraften att ständigt bli bättre, samt en sällsynt känsla och lyhördhet.'
                ]
            },
        ],
        pieces: [
            {
                name: 'Bernhard Crusell Concertino för fagott och ork B-dur',
                image: images_url+'bernhard1.jpg',
                spotify_url: 'https://open.spotify.com/track/237jHfE1ncGOWVmVaQSeiy',
                info: [
                    'Bernhard Crusell föddes i Nystad i Finland 1775, son till en fattig bokbindare. Han utbildade sig till klarinettist och trots en klen hälsa gick han in vid militärmusiken på Sveaborg.',
                    
                    'Som 16-åring följde han med sin välgörare major Wallenstjerna till Stockholm där han anställdes av Abbé Vogler vid Hovkapellet och var dess förste klarinettist till 1834.'+
                    '\n\nEfter klarinettstudier i Berlin studerade han komposition i Paris och mötte tonsättare som Cherubini och Méhul.'+
                    '\n\nCrusell blev som tonsättare känd redan under sin livstid och fick sina verk utgivna på internationella förlag, men som klarinettist framträdde han sparsamt utanför Sverige.',
                    
                    'De många klarinettkompositionerna tillkom huvudsakligen åren 1803 till 1812. Senare ägnade sig Crusell åt att komponera romanser, översätta operalibretton och odla sitt litterära intresse som förde honom till Götiska förbundet.',

                    'Hans sånger till Esaias Tegnérs Frithiofs saga beundrades både i Sverige och i Finland.'+
                    '\nHan komponerade även en opera 1824, Den lilla slavinnan, med ämne ur Tusen och en natt, som uppfördes 34 gånger på Kungliga teatern fram till 1838.',

                    'Crusell besökte aldrig Finland efter Tsarrysslands annektering 1809. I den finska självbilden uppfattas han ändå som finsk eftersom han var den första betydande tonsättaren som fötts i landet.'+
                    '\n\nDirigenten Robert Kajanus betecknade honom som ”den finska musikens fader”. Kanske i en iver att lansera ett ”inhemskt” alternativ till den tyskfödde Fredrik Pacius, som ju var den som lade grunden för musiklivet i Helsingfors? frågar sig Crusells biograf Fabian Dahlström.',

                    'Även om Crusell mest blev känd för sina klarinettkompositioner, som i elegans kan mäta sig med Carl Maria von Webers (som han för övrigt mötte), komponerade han också för andra instrument.',

                    'Concertinon i B-dur, skriven för Crusells svärson Franz Preumayer, den yngste av de tre fagottspelande bröder i Hovkapellet, uruppfördes i Ladugårdslandskyrkan i Stockholm den 24 september 1829.'+
                    '\nVerket, som var tänkt att ingå i en konsertturné, inleds med ett storstilat orkestertutti. Efter en lång kadens och ett följande allegro följer ett tema med variation på en melodi av den franske tonsättaren Boïeldieu.'+
                    '\nFinalen i verket, som går i en följd utan pauser, är en polonäs i tidens stil.'+
                    '\n\n- Henry Larsson'
                ],
                composer: {
                    name: 'Bernhard Henrik Crusell',
                    image: images_url+'bernhard2.jpg',
                    website_url: 'https://sv.wikipedia.org/wiki/Bernhard_Crusell',
                    spotify_url: 'https://open.spotify.com/artist/6RZnn5duxDdSsDoaoRaibD',
                    born: '15 oktober 1775, Nystad, Finland.',
                    dead: '28 juli 1838, Stockholm.',
                    works: 'Tre klarinettkonserter, kammarmusik bl a tre klarinettkvartetter, verk för manskör, en rad romanser samt operan Den lilla slavinnan.',
                    more: [
                        'Om den unge Crusell:'+
                        '\n\nI hans födelsestad fanns blott en enda person som idkade musik.'+
                        ' Det var en bodbetjänt som om sommaraftnarna roade sig att blåsa flöjt.'+
                        ' Utanför dennes fönster fanns den lille fyraårige Berndt sent om en afton sittande på gatan, med ryggen stödd mot väggen och utom sig av förtjusning över de ljuva tonerna.',

                        'Hans föräldrar, som länge sökt honom med oro bannade honom allvarsamt.'+
                        ' Men detta hindrade honom ej att nästa morgon återta sin favoritplats.'+
                        ' Han blev nu agad för sin olydnad, men sedan även detta icke hjälpte, överlämnade man honom åt sin vurm, övertygad att han alltid skulle komma hem, så fort flöjten tystnat.'+
                        '\n\nUr Crusells egna anteckningar – om sig själv i tredje person.'
                    ]
                }
            },
            {
                name: 'Antonín Dvorák Symfoni nr 8 G-dur',
                image: images_url+'dvorak1.jpg',
                spotify_url: 'https://play.spotify.com/track/0UrvHOMzTnvGzM0fiBSTNW',
                info: [
                    'Liksom fallet är med en rad andra tonsättares symfonier, har under årens lopp vissa problem uppstått med numreringen hos Antonin Dvorák och det är först under senare är, närmare bestämt efter andra världskriget, som man har kommit fram till en viss enhetlighet.',
                    
                    'Anledningen till den förbistring som rädde tidigare var att Dvorák hade en schism med sin berlinske förläggare Simrock.'+
                    '\n\nDenne, som hade gjort en smärre förmögenhet på Dvoráks slaviska danser, som man kunde höra misshandlas på fyrhändigt piano i minsta kyffe, klagade över att den tjeckoslova­kiske mästarens större verk inte alls gav samma inkomster, och när Antonin Dvorák lämnade in sin G­-dursymfoni visade sig Simrock föga intresserad.'+
                    '\n\nEn irriterad brevväxling kom till stånd, och slutet på det hela blev att Dvorák lät trycka symfonin hos den engelska firman Novello.',

                    'Men detta innebar nya svårigheter: Simrock, som förstås insåg att han nu riskerade att en "fet fisk" gled ur hans händer, åberopade ett kontrakt som skrivits ett par år tidigare, och han började göra anspråk på uppföranderätten i Tyskland (symfonin hade vid det laget redan spelats i Tjeckoslovakien).'+
                    '\n\nAntonin Dvorák var givetvis förgrymmad över Simrocks beteende och lät publicera ytterligare ett större verk, Requiem, hos Novello, men efter en längre tids förnyad korrespon­dens lyckades Simrock få honom att återvända till fadershuset.'+
                    '\nDärefter publicerades alla Antonin Dvorák verk hos Berlin-förlaget.',

                    'Hela denna manipulation, plus bl a det faktum att Simrock väntade med att trycka ett par av Dvorák symfonier till efter hans död, gjorde dock att den dåtida numreringen inte alls stämde.'+
                    '\nG-dursymfonin var alltså länge känd som nr 4, och "Från nya världen" som nr 5 (numera bär den nr 9).',

                    '1889 hade Antonin Dvorák i ett brev till en vän klagat över att hans huvud var så "fullt av ideer" att han bara kunde beklaga att det tog så lång tid att skriva ned dem.'+
                    '\nAtt han, i motsats till detta uttalande, var kapabel att arbeta synnerligen snabbt bevisas av att symfonin, som påbörjades i augusti samma år, var klar efter bara tre månader.'+
                    '\nDen är tillägnad "Kejsar Franz Josefs böhmiska akademi för konstens och litteraturens fromma, med tack för mitt inval".',

                    'Näst efter "Från nya världen" lär Antonin Dvoráks åttonde symfoni vara hans mest populära.'+
                    '\nVad som i alla tider har tilltalat åhörarna är säkerligen dess sorglösa och rättframma grundstäm­ning, tillsammans med dess omisskänligt böhmiska tongångar.'+
                    ' Idyll och livsglädje genomsy­rar hela detta med rätta älskade mästerverk.'+
                    '\n\n- Per Skans'
                ],
                composer: {
                        name: 'Antonín Dvorák',
                        image: images_url+'dvorak2.jpg',
                        website_url: 'https://sv.wikipedia.org/wiki/Anton%C3%ADn_Dvo%C5%99%C3%A1k',
                        spotify_url: 'https://open.spotify.com/artist/6n7nd5iceYpXVwcx8VPpxF',
                        born: '8 september 1841 i Nelahozeves, Tjeckien.',
                        dead: '1 maj 1904 i Prag.',
                        works: 'Nio symfonier, t ex nr 9 Från nya världen, tio operor t ex Rusalka, fem symfoniska dikter, t ex Heldenlied, fyra större körverk, sex konserter, kammarmusik.',
                        more: [
                            'Om folkmusik:'+
                            '\nDvorák var starkt intresserad av mährisk och böhmisk folkmusik och inspirerades ofta av folkmusikaliska idiom i sina egna kompositioner.'+
                            '\nNär han bodde i USA i slutet av 1800-talet ville han utforska traditionell amerikansk musik och uppmuntrade afroamerikanska och indianska influenser i strävan efter en nationell musikalisk identitet.'
                        ]
                }
            },
            {
                name: 'BERWALDBONUS: TONSÄTTARINNOR',
                image: images_url+'valborg.jpg',
                spotify_url: 'https://open.spotify.com/artist/0dPXhX5Y4nNHF5XPUNXNd8',
                info: [
                    'Efter fyra av säsongens onsdagskonserter blir det kammarmusikaliska bonuskonserter med musik av svenska kvinnliga tonsättare från 1800-talets andra och 1900-talets första hälft.'+
                    '\n\nKonserterna är ett samarbete mellan Berwaldhallen och Sveriges Radio P2 och introduceras av musikforskaren och producenten Christina Tobeck.',

                    'Berwaldbonusen sker i direkt anslutning till konsertenoch du som har besökt kvällens huvudkonsert kan kostnadsfritt stanna kvar på bonuskonserten.'+
                    '\n\nAbonnenter får som förmån alla Berwaldbonuskonserterna kostnadsfritt. Ta med ditt abonnemangskort!'+
                    '\n\nDu får gärna försöka hitta en plats närmare scenen eftersom kammarmusiken är i det mindre formatet.',

                    'Per Sporrong: violin'+
                    '\nJohan Ullén: piano'+
                    '\n\nValborg Aulin: Sonat för violin och piano'+
                    '\nValborg Aulin: Pianostycken'+
                    '\nValborg Aulin: Albumblad'+
                    '\n(transkription för violin och piano av tonsättaren)'+
                    '\nValborg Aulin: Elegie op 8:3 (transkription för violin och piano av tonsättaren)'
                ]
            }
        ]
    },
}