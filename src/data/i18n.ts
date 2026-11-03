// =============================================================================
// INTERNACIONALIZACIÓN (ES / EN / PT)
// =============================================================================
// El sitio se escribe en español. Las páginas espejo en /en/ y /pt/ cubren las
// cinco rutas esenciales (/, nosotros, publicaciones, prensa, contacto): el resto
// del contenido (notas de prensa, visor, documentos) sigue en español y el lector
// puede traducirlo con su navegador.
//
// Este módulo agrupa TODO el texto de interfaz y de esas páginas para EN y PT.
// Para modificar una traducción, editá aquí y volvé a compilar.
// =============================================================================

import { conBase } from '../lib/rutas';

export type Idioma = 'es' | 'en' | 'pt';

/** Rutas que tienen espejo en /en/ y /pt/. */
export const RUTAS_TRADUCIDAS = ['/', '/nosotros/', '/publicaciones/', '/prensa/', '/contacto/'];

/** Quita el prefijo de idioma de una ruta interna ('/en/nosotros/' -> '/nosotros/'). */
const sinPrefijo = (ruta: string): string => {
  const m = ruta.match(/^\/(?:en|pt)(\/.*)?$/);
  return m ? (m[1] ?? '/') : ruta;
};

/** Convierte una ruta interna de la raíz a su ruta de idioma ('/' -> '/en/'). */
export const rutaIdioma = (lang: 'en' | 'pt', ruta: string): string =>
  conBase(ruta === '/' ? `/${lang}/` : `/${lang}${ruta}`);

/**
 * Alternatas hreflang de la página actual (la ruta debe incluir el base).
 * Devuelve null cuando la página no tiene espejo traducido.
 */
export interface Alternatas {
  es: string;
  en: string;
  pt: string;
  xDefault: string;
}

export const alternatasDe = (pathname: string): Alternatas | null => {
  const base = import.meta.env.BASE_URL === '/' ? '' : import.meta.env.BASE_URL.replace(/\/$/, '');
  const interna = sinPrefijo(base && pathname.startsWith(base) ? pathname.slice(base.length) : pathname) || '/';
  if (!RUTAS_TRADUCIDAS.includes(interna)) return null;
  const es = conBase(interna);
  const en = rutaIdioma('en', interna);
  const pt = rutaIdioma('pt', interna);
  return { es, en, pt, xDefault: es };
};

/** Diccionario completo de una traducción. */
interface DiccionarioI18n {
  /** Atributo lang del <html>. */
  htmlLang: string;
  /** og:locale. */
  ogLocale: string;
  /** Valor de inLanguage en JSON-LD. */
  schemaLang: string;
  /** Debe venir falso en la home; entrará por prop. */
  ui: {
    /** Enlace "saltar al contenido". */
    saltar: string;
    /** Primera miga de pan y enlace del logo. */
    inicio: string;
    ariaLogo: string;
    buscar: string;
    menu: string;
    cerrar: string;
  };
  nav: { etiqueta: string; href: string }[];
  alertas: {
    etiqueta: string;
    items: { tipo: string; texto: string; href: string }[];
  };
  footer: {
    descripcion: string;
    lema: string;
    secciones: string;
    institucional: string;
    contacto: string;
    canalWhatsApp: string;
    srNuevaPestana: string;
    redes: string;
    politicasTitulo: string;
    politicas: { etiqueta: string; href: string }[];
    derechos: string;
  };
  boletin: {
    titulo: string;
    detalle: string;
    suscribirse: string;
    politica: string;
    mensajes: Record<string, string>;
  };
  contenido: {
    inicio: {
      titulo: string;
      nombreLargo: string;
      descripcion: string;
      presentacion: string;
      ctaInformes: string;
      ctaConocer: string;
      enlacesRapidos: { titulo: string; descripcion: string; href: string }[];
      informe: {
        franja: string;
        franjaTexto: string;
        franjaCta: string;
        titulo: string;
        bajada: string;
        labelDesafios: string;
        desafios: string[];
        ctaLeer: string;
        ctaPdf: string;
        srPdf: string;
        altImagen: string;
        tabla: { titulo: string; caption: string; fuente: string; plazo: string; horizonte: string; firme: string; filas: { fuente: string; plazo: string; horizonte: string; firme: boolean }[] };
        cifras: { valor: string; etiqueta: string }[];
        paradigma: { titulo: string; antes: string; ahora: string; texto: string; antesLabel: string; ahoraLabel: string };
      };
      recientes: { sobretitulo: string; titulo: string; cta: string; nota: string };
      nosotros: { sobretitulo: string; titulo: string; parrafo: string; cta: string };
      mision: { titulo: string; texto: string };
      vision: { titulo: string; texto: string };
      valores: { titulo: string; items: { titulo: string; descripcion: string }[] };
      ejes: { sobretitulo: string; titulo: string; items: { titulo: string; descripcion: string; icono: string }[] };
    };
    nosotros: {
      titulo: string;
      descripcion: string;
      nombres: { historia: string; misionTitulo: string; valoresTitulo: string; equipoTitulo: string; marcoTitulo: string; ctaDescargas: string };
      historia: { titulo: string; parrafos: string[] };
      fundado: string;
      fundadoLugar: string;
      verActa: string;
      misionVision: { mision: string; vision: string; misionTexto: string; visionTexto: string };
      valoresItems: { titulo: string; descripcion: string }[];
      equipo: { nombre: string; rol: string; bio: string }[];
      notaDocumentos: string;
    };
    publicaciones: {
      titulo: string;
      descripcion: string;
      notaArchivo: string;
      contador: string;
      wa: { titulo: string; texto: string; cta: string };
    };
    prensa: {
      titulo: string;
      descripcion: string;
      secciones: { comunicados: string; medios: string; eventos: string };
      notaEspanol: string;
      eventos: { proximos: string; pasados: string; vacio: string };
      contador: { comunicados: string; apariciones: string };
    };
    contacto: {
      titulo: string;
      descripcion: string;
      cita: string;
      datos: { sede: string; email: string; telefono: string };
      form: {
        srTitulo: string;
        avisoEnviado: string;
        avisoError: string;
        consultaPlaceholder: string;
        consultaBoton: string;
        nombre: string;
        nombrePlaceholder: string;
        email: string;
        mensaje: string;
        honeypot: string;
        obligatorios: string;
        privacidad: string;
        privacidadEnlace: string;
        srNuevaPestana: string;
      };
    };
  };
}

import { urlVisor } from './publicaciones';

const hrefAlertas = (interna: string) => conBase(interna);

export const diccionarios: Record<'en' | 'pt', DiccionarioI18n> = {
  // =========================================================================
  // INGLÉS
  // =========================================================================
  en: {
    htmlLang: 'en',
    ogLocale: 'en_US',
    schemaLang: 'en',
    ui: {
      saltar: 'Skip to main content',
      inicio: 'Home',
      ariaLogo: 'IPPSE — Go to homepage',
      buscar: 'Search',
      menu: 'Menu',
      cerrar: 'Close',
    },
    nav: [
      { etiqueta: 'Home', href: conBase('/en/') },
      { etiqueta: 'About us', href: conBase('/en/nosotros/') },
      { etiqueta: 'Reports & Publications', href: conBase('/en/publicaciones/') },
      { etiqueta: 'Press & News', href: conBase('/en/prensa/') },
      { etiqueta: 'Contact', href: conBase('/en/contacto/') },
    ],
    alertas: {
      etiqueta: 'Breaking news',
      items: [
        { tipo: 'Report', texto: 'Technical Report No. 2/26: alternatives for new generation sources', href: urlVisor('informe-2-26') },
        { tipo: 'Alert', texto: 'Critical window 2028–2030: risk of power and energy shortfall', href: urlVisor('informe-1-26') },
        { tipo: 'Report', texto: 'Technical Report No. 1/26: current generation sources', href: urlVisor('informe-1-26') },
        { tipo: 'Event', texto: 'Technical forum on diversifying the electricity generation mix', href: hrefAlertas('/en/prensa/#eventos') },
      ],
    },
    footer: {
      descripcion:
        'Technical, independent civil association of power sector professionals, dedicated to the study, analysis and development of strategic proposals to strengthen the national electricity sector.',
      lema: "Promoting Paraguay's energy sovereignty",
      secciones: 'Sections',
      institucional: 'Institutional documents',
      contacto: 'Contact',
      canalWhatsApp: 'WhatsApp channel',
      srNuevaPestana: '(opens in a new tab)',
      redes: 'Social media',
      politicasTitulo: 'Site policies',
      politicas: [
        { etiqueta: 'Privacy', href: conBase('/privacidad/') },
        { etiqueta: 'Accessibility', href: conBase('/accesibilidad/') },
        { etiqueta: 'Terms of use', href: conBase('/terminos/') },
        { etiqueta: 'RSS', href: conBase('/rss.xml') },
      ],
      derechos: 'Institute of Paraguayan Professionals of the Electrical Sector. All rights reserved.',
    },
    boletin: {
      titulo: 'Get the new reports by email',
      detalle: 'Only when we publish a report or a statement. You can unsubscribe at any time.',
      suscribirse: 'Subscribe',
      politica: 'privacy policy',
      mensajes: {
        pendiente: 'Done: we have sent you an email. Please confirm your subscription from the link you received.',
        invalido: 'That email address is not valid. Please check it and try again.',
        error: 'We could not register the subscription. Please try again in a few minutes.',
      },
    },
    contenido: {
      inicio: {
        titulo: 'Home',
        nombreLargo: 'Institute of Paraguayan Professionals of the Electrical Sector (IPPSE)',
        descripcion:
          'Promoting the sovereignty, security and sustainability of energy in Paraguay. A technical, independent civil association dedicated to strengthening the national electricity sector.',
        presentacion:
          'Promoting the sovereignty, security and sustainability of energy in Paraguay. We are a technical, independent civil association dedicated to the study, analysis and development of strategic proposals to strengthen the national electricity sector.',
        ctaInformes: 'View technical reports',
        ctaConocer: 'Learn about the IPPSE',
        enlacesRapidos: [
          { titulo: 'Technical reports', descripcion: 'Diagnostics, proposals and essays by the IPPSE.', href: conBase('/en/publicaciones/') },
          { titulo: 'Constitution', descripcion: "The Institute's founding document.", href: conBase('/institucional/#constitución') },
          { titulo: 'Statutes', descripcion: 'Organization, authorities and membership.', href: conBase('/institucional/#estatutos') },
          { titulo: 'Code of Ethics', descripcion: 'Principles of conduct for members.', href: conBase('/institucional/#código-de-ética') },
        ],
        informe: {
          franja: '2028–2030',
          franjaTexto:
            'Only a few years left to decide: the fastest alternatives (solar with batteries and interconnections) take 3 to 5 years to become operational, and the largest ones up to 15.',
          franjaCta: 'View the report and the timelines',
          titulo: 'Paraguay needs new power generation from 2028',
          bajada:
            'Faced with the risk of an energy crisis caused by a shortfall in power and energy, the IPPSE evaluates the possible new generation sources for Paraguay —their objectives, feasibility, costs and schedules— to meet the requirements of the national electricity system.',
          labelDesafios: 'The three challenges',
          desafios: [
            'Overcome the “critical window 2028–2030”, when new generation sources must be added to avoid a power and energy shortfall from 2031 onwards.',
            'Sustain the large and constant future requirements for electric generation of the system.',
            'Diversify the electro-energy mix so as not to depend exclusively on hydropower.',
          ],
          ctaLeer: 'Read the full report',
          ctaPdf: 'Official PDF',
          srPdf: 'of Technical Report No. 2/26 (opens in a new tab)',
          altImagen: 'Itaipú dam at sunset',
          tabla: {
            titulo: 'Options and commissioning timelines',
            caption: 'Electricity generation sources and estimated commissioning timelines, according to Technical Report No. 2/26',
            fuente: 'Source',
            plazo: 'Timeline',
            horizonte: 'Horizon',
            firme: 'firm energy',
            filas: [
              { fuente: 'Solar plants with battery banks', plazo: '3 to 4 years', horizonte: 'Short, medium and long term', firme: false },
              { fuente: 'Electric interconnection with Brazil', plazo: '4 to 5 years', horizonte: 'Short, medium and long term', firme: false },
              { fuente: 'Electric interconnection with Argentina', plazo: '4 to 5 years', horizonte: 'Short, medium and long term', firme: false },
              { fuente: 'Hydroelectric plants on inland rivers', plazo: '5 to 6 years each', horizonte: 'Complementary', firme: false },
              { fuente: 'Wind plants', plazo: '5 to 7 years', horizonte: 'Complementary', firme: false },
              { fuente: 'Thermal power plants', plazo: '7 to 10 years', horizonte: 'Medium and long term', firme: true },
              { fuente: 'Binational hydroelectric plants', plazo: '10 to 14 years', horizonte: 'Medium and long term', firme: false },
              { fuente: 'Nuclear plants (SMR)', plazo: '12 to 15 years', horizonte: 'Medium and long term', firme: true },
            ],
          },
          cifras: [
            { valor: '+500 MW/year', etiqueta: 'Annual demand growth that the national electricity system will have to cope with' },
            { valor: '1,500 MW', etiqueta: 'Estimated interconnection capacity at the Yacyretá HPP (swap operation with Argentina)' },
            { valor: '5,000 MW', etiqueta: 'Maximum flow-reversal capacity of the Itaipú HVDC system, to be negotiated with Brazil' },
            { valor: '1,725 kWh/m²·year', etiqueta: 'Solar radiation density: over 310 sunny days per year on average' },
          ],
          paradigma: {
            titulo: 'A paradigm change',
            antesLabel: 'Before',
            antes: 'Clean, abundant and cheap energy',
            ahoraLabel: 'Now',
            ahora: 'Sufficient energy, at reasonable costs and prices',
            texto:
              'The imminent exhaustion of the capacity of today’s hydroelectric sources (year 2030) and the necessary diversification of sources, with the costs of energy production rising gradually and continuously, lead Paraguay to a paradigm change in its electricity supply.',
          },
        },
        recientes: {
          sobretitulo: 'Technical intelligence',
          titulo: 'Recent reports and publications',
          cta: 'View all',
          nota: 'Reports are published in Spanish.',
        },
        nosotros: {
          sobretitulo: 'Who we are',
          titulo: 'The bridge between technical expertise and State policies',
          parrafo:
            'The IPPSE brings together the most qualified technical and professional talent of Paraguayan engineering and the power sector. Faced with the rapid growth of energy demand and the challenges of transmission, distribution and generation, the institute acts as a bridge between technical expertise, public opinion and State policies.',
          cta: 'Learn about our history',
        },
        mision: {
          titulo: 'Mission',
          texto:
            'To foster the sustainable and efficient development of the Paraguayan electricity system through rigorous analysis, applied research, specialized debate and the formulation of strategic recommendations for national energy policy.',
        },
        vision: {
          titulo: 'Vision',
          texto:
            'To be the civil, technical and scientific reference organization on energy matters in Paraguay, promoting long-term planning, diversification of the electricity mix and energy sovereignty.',
        },
        valores: {
          titulo: 'Values',
          items: [
            { titulo: 'Independence', descripcion: 'Technical analysis free from political or commercial constraints.' },
            { titulo: 'Technical rigor', descripcion: 'Applied research based on data and verifiable evidence.' },
            { titulo: 'Collaboration', descripcion: 'Convergence of the country’s most qualified professional talent.' },
          ],
        },
        ejes: {
          sobretitulo: 'Strategic focus areas',
          titulo: 'Four lines of work for the national power sector',
          items: [
            { titulo: 'Strategic Planning and Foresight', descripcion: 'Continuous monitoring and assessment of the balance between electricity supply and demand.', icono: 'lucide:chart-line' },
            { titulo: 'Diversification of the Energy Mix', descripcion: 'Promotion of renewable energies (solar, wind, biomass) and complementary solutions to hydropower.', icono: 'lucide:sun' },
            { titulo: 'Institutional Strengthening', descripcion: 'Support for legislative projects, creation of a Ministry of Energy and swifter progress on Master Plans.', icono: 'lucide:landmark' },
            { titulo: 'Outreach and Training', descripcion: 'Forums, technical seminars and early-warning reports on the electricity system.', icono: 'lucide:graduation-cap' },
          ],
        },
      },
      nosotros: {
        titulo: 'About us',
        descripcion:
          'History, mission, values and team of the Institute of Paraguayan Professionals of the Electrical Sector, an independent technical association serving national energy development.',
        nombres: {
          historia: 'A track record in the national power sector',
          misionTitulo: 'Our purpose and horizon',
          valoresTitulo: 'The principles that guide our work',
          equipoTitulo: 'Leading figures of the power sector',
          marcoTitulo: 'Institutional documents',
          ctaDescargas: 'PDF downloads',
        },
        historia: {
          titulo: 'Technical talent at the service of the Paraguayan power sector',
          parrafos: [
            'The IPPSE brings together the most qualified technical and professional talent of Paraguayan engineering and the power sector. Faced with the rapid growth of energy demand and the challenges of transmission, distribution and generation, the institute acts as a bridge between technical expertise, public opinion and State policies.',
            'We are an independent technical civil association, dedicated to the study, analysis and development of strategic proposals to strengthen the national electricity sector. Our work rests on scientific rigor, energy foresight and a commitment to Paraguay’s energy sovereignty.',
          ],
        },
        fundado: 'Founded on',
        fundadoLugar: 'Asunción, Republic of Paraguay',
        verActa: 'View the founding charter',
        misionVision: {
          mision: 'Mission',
          vision: 'Vision',
          misionTexto:
            'To foster the sustainable and efficient development of the Paraguayan electricity system through rigorous analysis, applied research, specialized debate and the formulation of strategic recommendations for national energy policy.',
          visionTexto:
            'To be the civil, technical and scientific reference organization on energy matters in Paraguay, promoting long-term planning, diversification of the electricity mix and energy sovereignty.',
        },
        valoresItems: [
          { titulo: 'Independence', descripcion: 'Technical analysis free from political or commercial constraints.' },
          { titulo: 'Technical rigor', descripcion: 'Applied research based on data and verifiable evidence.' },
          { titulo: 'Collaboration', descripcion: 'Convergence of the country’s most qualified professional talent.' },
        ],
        equipo: [
          {
            nombre: 'Eng. Ángel María Recalde',
            rol: 'President · Leading figure of the power sector',
            bio: 'Electrical engineer with decades of experience in planning and management of the national energy system.',
          },
          {
            nombre: 'Board of Directors',
            rol: 'Multidisciplinary technical team',
            bio: 'Professionals in engineering, economics and energy law who make up the governing body of the IPPSE.',
          },
          {
            nombre: 'Technical Advisory Committee',
            rol: 'Specialists in generation, transmission and distribution',
            bio: 'Expert group responsible for preparing diagnoses, reports and technical proposals.',
          },
        ],
        notaDocumentos: 'Institutional documents are published in Spanish.',
      },
      publicaciones: {
        titulo: 'Reports & Publications',
        descripcion:
          'Repository of diagnostics, strategic proposals and technical essays produced by the IPPSE to strengthen the national electricity sector.',
        notaArchivo: 'Archive of IPPSE reports (the Institute has been at work since 1993). Reports are published in Spanish.',
        contador: 'publications',
        wa: {
          titulo: 'Receive the reports and take part',
          texto:
            'Join the IPPSE WhatsApp channel to receive the technical reports and power sector news, and take part in citizen participation initiatives.',
          cta: 'Join the WhatsApp channel',
        },
      },
      prensa: {
        titulo: 'Press & News',
        descripcion: 'Press statements, media coverage and the agenda of IPPSE events, forums and debates.',
        secciones: { comunicados: 'Press statements', medios: 'Media coverage', eventos: 'Events, forums and debates' },
        notaEspanol: 'Statements and their full text are published in Spanish.',
        eventos: { proximos: 'Upcoming', pasados: 'Held', vacio: 'No events are scheduled at the moment.' },
        contador: { comunicados: 'statements', apariciones: 'appearances' },
      },
      contacto: {
        titulo: 'Contact',
        descripcion: 'Contact the Institute of Paraguayan Professionals of the Electrical Sector (IPPSE): inquiries, press and institutions.',
        cita:
          'Paraguay’s energy sovereignty is built on long-term planning, technical rigor and the convergence of professional talent within the sector.',
        datos: { sede: 'Headquarters', email: 'Email', telefono: 'Phone' },
        form: {
          srTitulo: 'Contact form',
          avisoEnviado: 'Message sent. We will reply shortly.',
          avisoError: 'The message could not be sent. Please check the details or write us directly at',
          consultaPlaceholder: 'How can we help you?',
          consultaBoton: 'Send message',
          nombre: 'Full name',
          nombrePlaceholder: 'Your name',
          email: 'Email',
          mensaje: 'Message',
          honeypot: 'Do not fill in',
          obligatorios: 'Required fields',
          privacidad: 'We only use your data to reply to you. More information in our',
          privacidadEnlace: 'privacy policy',
          srNuevaPestana: '(opens in a new tab)',
        },
      },
    },
  },

  // =========================================================================
  // PORTUGUÉS
  // =========================================================================
  pt: {
    htmlLang: 'pt-BR',
    ogLocale: 'pt_BR',
    schemaLang: 'pt-BR',
    ui: {
      saltar: 'Pular para o conteúdo principal',
      inicio: 'Início',
      ariaLogo: 'IPPSE — Ir para a página inicial',
      buscar: 'Buscar',
      menu: 'Menu',
      cerrar: 'Fechar',
    },
    nav: [
      { etiqueta: 'Início', href: conBase('/pt/') },
      { etiqueta: 'Quem somos', href: conBase('/pt/nosotros/') },
      { etiqueta: 'Relatórios e Publicações', href: conBase('/pt/publicaciones/') },
      { etiqueta: 'Imprensa e Novidades', href: conBase('/pt/prensa/') },
      { etiqueta: 'Contato', href: conBase('/pt/contacto/') },
    ],
    alertas: {
      etiqueta: 'Últimas notícias',
      items: [
        { tipo: 'Relatório', texto: 'Relatório Técnico nº 2/26: alternativas de novas fontes de geração', href: urlVisor('informe-2-26') },
        { tipo: 'Alerta', texto: 'Janela crítica 2028–2030: risco de déficit de potência e energia', href: urlVisor('informe-1-26') },
        { tipo: 'Relatório', texto: 'Relatório Técnico nº 1/26: fontes de geração atuais', href: urlVisor('informe-1-26') },
        { tipo: 'Evento', texto: 'Fórum técnico sobre a diversificação da matriz de geração elétrica', href: hrefAlertas('/pt/prensa/#eventos') },
      ],
    },
    footer: {
      descripcion:
        'Associação civil técnica e independente de profissionais do setor elétrico, dedicada ao estudo, à análise e ao desenvolvimento de propostas estratégicas para o fortalecimento do setor elétrico nacional.',
      lema: 'Promovendo a soberania energética do Paraguai',
      secciones: 'Seções',
      institucional: 'Documentos institucionais',
      contacto: 'Contato',
      canalWhatsApp: 'Canal do WhatsApp',
      srNuevaPestana: '(abre em uma nova aba)',
      redes: 'Redes sociais',
      politicasTitulo: 'Políticas do site',
      politicas: [
        { etiqueta: 'Privacidade', href: conBase('/privacidad/') },
        { etiqueta: 'Acessibilidade', href: conBase('/accesibilidad/') },
        { etiqueta: 'Termos de uso', href: conBase('/terminos/') },
        { etiqueta: 'RSS', href: conBase('/rss.xml') },
      ],
      derechos: 'Instituto de Profissionais Paraguaios do Setor Elétrico. Todos os direitos reservados.',
    },
    boletin: {
      titulo: 'Receba os novos relatórios por e-mail',
      detalle: 'Somente quando publicamos um relatório ou um comunicado. Você pode cancelar a inscrição quando quiser.',
      suscribirse: 'Inscrever-se',
      politica: 'política de privacidade',
      mensajes: {
        pendiente: 'Pronto: enviamos um e-mail a você. Confirme a inscrição pelo link que você recebeu.',
        invalido: 'Esse e-mail não é válido. Confira e tente novamente.',
        error: 'Não foi possível registrar a inscrição. Tente novamente em alguns minutos.',
      },
    },
    contenido: {
      inicio: {
        titulo: 'Início',
        nombreLargo: 'Instituto de Profissionais Paraguaios do Setor Elétrico (IPPSE)',
        descripcion:
          'Promovendo a soberania, a segurança e a sustentabilidade energética do Paraguai. Associação civil técnica e independente dedicada ao fortalecimento do setor elétrico nacional.',
        presentacion:
          'Promovendo a soberania, a segurança e a sustentabilidade energética do Paraguai. Somos uma associação civil técnica e independente dedicada ao estudo, à análise e ao desenvolvimento de propostas estratégicas para o fortalecimento do setor elétrico nacional.',
        ctaInformes: 'Ver os relatórios técnicos',
        ctaConocer: 'Conhecer o IPPSE',
        enlacesRapidos: [
          { titulo: 'Relatórios técnicos', descripcion: 'Diagnósticos, propostas e ensaios do IPPSE.', href: conBase('/pt/publicaciones/') },
          { titulo: 'Constituição', descripcion: 'Documento fundacional do Instituto.', href: conBase('/institucional/#constitución') },
          { titulo: 'Estatutos', descripcion: 'Organização, autoridades e associados.', href: conBase('/institucional/#estatutos') },
          { titulo: 'Código de Ética', descripcion: 'Princípios de conduta dos membros.', href: conBase('/institucional/#código-de-ética') },
        ],
        informe: {
          franja: '2028–2030',
          franjaTexto:
            'Restam poucos anos para decidir: as alternativas mais rápidas (solar com baterias e interconexões) levam de 3 a 5 anos para entrar em operação, e as de maior porte, até 15.',
          franjaCta: 'Ver o relatório e os prazos',
          titulo: 'O Paraguai precisa de nova geração elétrica a partir de 2028',
          bajada:
            'Diante do risco de crise energética por déficit de potência e energia, o IPPSE avalia as possíveis novas fontes de geração do Paraguai — seus objetivos, viabilidades, custos e cronogramas — para atender aos requerimentos do sistema elétrico nacional.',
          labelDesafios: 'Os três desafios',
          desafios: [
            'Superar o “lapso crítico 2028–2030”, quando devem ser incorporadas novas fontes de geração para evitar o déficit de potência e energia a partir de 2031.',
            'Sustentar os grandes e constantes requerimentos futuros de geração elétrica do sistema.',
            'Diversificar a matriz eletroenergética para não depender exclusivamente da hidroeletricidade.',
          ],
          ctaLeer: 'Ler o relatório completo',
          ctaPdf: 'PDF oficial',
          srPdf: 'do Relatório Técnico nº 2/26 (abre em uma nova aba)',
          altImagen: 'Represa de Itaipu ao pôr do sol',
          tabla: {
            titulo: 'Alternativas e prazos de habilitação',
            caption: 'Fontes de geração elétrica e prazos estimados de habilitação, segundo o Relatório Técnico nº 2/26',
            fuente: 'Fonte',
            plazo: 'Prazo',
            horizonte: 'Horizonte',
            firme: 'energia firme',
            filas: [
              { fuente: 'Usinas solares com bancos de baterias', plazo: '3 a 4 anos', horizonte: 'Curto, médio e longo prazo', firme: false },
              { fuente: 'Interconexão elétrica com o Brasil', plazo: '4 a 5 anos', horizonte: 'Curto, médio e longo prazo', firme: false },
              { fuente: 'Interconexão elétrica com a Argentina', plazo: '4 a 5 anos', horizonte: 'Curto, médio e longo prazo', firme: false },
              { fuente: 'Usinas hidrelétricas de rios interiores', plazo: '5 a 6 anos cada', horizonte: 'Complementar', firme: false },
              { fuente: 'Usinas eólicas', plazo: '5 a 7 anos', horizonte: 'Complementar', firme: false },
              { fuente: 'Usinas termelétricas', plazo: '7 a 10 anos', horizonte: 'Médio e longo prazo', firme: true },
              { fuente: 'Usinas hidrelétricas binacionais', plazo: '10 a 14 anos', horizonte: 'Médio e longo prazo', firme: false },
              { fuente: 'Usinas nucleares (SMR)', plazo: '12 a 15 anos', horizonte: 'Médio e longo prazo', firme: true },
            ],
          },
          cifras: [
            { valor: '+500 MW/ano', etiqueta: 'Crescimento anual da demanda com o qual o sistema elétrico nacional terá de lidar' },
            { valor: '1.500 MW', etiqueta: 'Capacidade de interconexão estimada na UHE Yacyretá (operação swap com a Argentina)' },
            { valor: '5.000 MW', etiqueta: 'Capacidade máxima de inversão de fluxo do sistema HVDC de Itaipu, a negociar com o Brasil' },
            { valor: '1.725 kWh/m²·ano', etiqueta: 'Densidade de radiação solar: mais de 310 dias de sol por ano, em média' },
          ],
          paradigma: {
            titulo: 'Mudança de paradigma',
            antesLabel: 'Antes',
            antes: 'Energia limpa, abundante e barata',
            ahoraLabel: 'Agora',
            ahora: 'Energia suficiente, com custos e preços razoáveis',
            texto:
              'O próximo esgotamento da capacidade das atuais fontes hidrelétricas (ano 2030) e a necessária diversificação de fontes, com custos crescentes da energia produzida de forma gradual e contínua, levam o Paraguai a uma mudança de paradigma em seu abastecimento elétrico.',
          },
        },
        recientes: {
          sobretitulo: 'Inteligência técnica',
          titulo: 'Relatórios e publicações recentes',
          cta: 'Ver todos',
          nota: 'Os relatórios são publicados em espanhol.',
        },
        nosotros: {
          sobretitulo: 'Quem somos',
          titulo: 'A ponte entre a experiência técnica e as políticas de Estado',
          parrafo:
            'O IPPSE reúne o talento técnico e profissional mais qualificado da engenharia e do setor elétrico paraguaio. Diante do crescimento acelerado da demanda energética e dos desafios de transmissão, distribuição e geração, o instituto atua como ponte entre a experiência técnica, a opinião pública e as políticas de Estado.',
          cta: 'Conhecer nossa história',
        },
        mision: {
          titulo: 'Missão',
          texto:
            'Fomentar o desenvolvimento sustentável e eficiente do sistema elétrico paraguaio por meio de análise rigorosa, pesquisa aplicada, debate especializado e formulação de recomendações estratégicas para a política energética nacional.',
        },
        vision: {
          titulo: 'Visão',
          texto:
            'Ser o organismo civil de referência técnica e científica em matéria energética no Paraguai, impulsionando o planejamento de longo prazo, a diversificação da matriz elétrica e a soberania energética.',
        },
        valores: {
          titulo: 'Valores',
          items: [
            { titulo: 'Independência', descripcion: 'Análise técnica livre de condicionamentos políticos ou comerciais.' },
            { titulo: 'Rigor técnico', descripcion: 'Pesquisa aplicada baseada em dados e evidência comprovável.' },
            { titulo: 'Colaboração', descripcion: 'Convergência do talento profissional mais qualificado do país.' },
          ],
        },
        ejes: {
          sobretitulo: 'Eixos estratégicos',
          titulo: 'Quatro linhas de trabalho para o setor elétrico nacional',
          items: [
            { titulo: 'Planejamento Estratégico e Prospectiva', descripcion: 'Monitoramento e avaliação constantes do equilíbrio entre oferta e demanda elétrica.', icono: 'lucide:chart-line' },
            { titulo: 'Diversificação da Matriz Energética', descripcion: 'Promoção de energias renováveis (solar, eólica, biomassa) e soluções complementares à hidroeletricidade.', icono: 'lucide:sun' },
            { titulo: 'Fortalecimento Institucional', descripcion: 'Impulso a projetos legislativos, criação de um Ministério de Energia e agilização dos Planos Diretores.', icono: 'lucide:landmark' },
            { titulo: 'Divulgação e Capacitação', descripcion: 'Fóruns, seminários técnicos e relatórios de alerta precoce sobre o sistema elétrico.', icono: 'lucide:graduation-cap' },
          ],
        },
      },
      nosotros: {
        titulo: 'Quem somos',
        descripcion:
          'História, missão, valores e equipe do Instituto de Profissionais Paraguaios do Setor Elétrico, uma associação técnica independente a serviço do desenvolvimento energético nacional.',
        nombres: {
          historia: 'Uma trajetória no setor elétrico nacional',
          misionTitulo: 'Nosso propósito e horizonte',
          valoresTitulo: 'Os princípios que guiam nosso trabalho',
          equipoTitulo: 'Referências do setor elétrico',
          marcoTitulo: 'Documentos institucionais',
          ctaDescargas: 'Downloads em PDF',
        },
        historia: {
          titulo: 'Talento técnico a serviço do setor elétrico paraguaio',
          parrafos: [
            'O IPPSE reúne o talento técnico e profissional mais qualificado da engenharia e do setor elétrico paraguaio. Diante do crescimento acelerado da demanda energética e dos desafios de transmissão, distribuição e geração, o instituto atua como ponte entre a experiência técnica, a opinião pública e as políticas de Estado.',
            'Somos uma associação civil técnica e independente, dedicada ao estudo, à análise e ao desenvolvimento de propostas estratégicas para o fortalecimento do setor elétrico nacional. Nosso trabalho se fundamenta no rigor científico, na prospectiva energética e no compromisso com a soberania energética do Paraguai.',
          ],
        },
        fundado: 'Fundado em',
        fundadoLugar: 'Assunção, República do Paraguai',
        verActa: 'Ver a Ata de constituição',
        misionVision: {
          mision: 'Missão',
          vision: 'Visão',
          misionTexto: 'Fomentar o desenvolvimento sustentável e eficiente do sistema elétrico paraguaio por meio de análise rigorosa, pesquisa aplicada, debate especializado e formulação de recomendações estratégicas para a política energética nacional.',
          visionTexto: 'Ser o organismo civil de referência técnica e científica em matéria energética no Paraguai, impulsionando o planejamento de longo prazo, a diversificação da matriz elétrica e a soberania energética.',
        },
        valoresItems: [
          { titulo: 'Independência', descripcion: 'Análise técnica livre de condicionamentos políticos ou comerciais.' },
          { titulo: 'Rigor técnico', descripcion: 'Pesquisa aplicada baseada em dados e evidência comprovável.' },
          { titulo: 'Colaboração', descripcion: 'Convergência do talento profissional mais qualificado do país.' },
        ],
        equipo: [
          { nombre: 'Eng. Ángel María Recalde', rol: 'Presidente · Referência do setor elétrico', bio: 'Engenheiro eletricista com décadas de experiência em planejamento e gestão do sistema energético nacional.' },
          { nombre: 'Diretoria', rol: 'Equipe técnica multidisciplinar', bio: 'Profissionais da engenharia, da economia e do direito energético que compõem o corpo diretor do IPPSE.' },
          { nombre: 'Comitê Técnico Consultivo', rol: 'Especialistas em geração, transmissão e distribuição', bio: 'Grupo de especialistas responsável pela elaboração de diagnósticos, relatórios e propostas técnicas.' },
        ],
        notaDocumentos: 'Os documentos institucionais são publicados em espanhol.',
      },
      publicaciones: {
        titulo: 'Relatórios e Publicações',
        descripcion: 'Repositório de diagnósticos, propostas estratégicas e ensaios técnicos elaborados pelo IPPSE para o fortalecimento do setor elétrico nacional.',
        notaArchivo: 'Arquivo de relatórios do IPPSE (o Instituto está em atividade desde 1993). Os relatórios são publicados em espanhol.',
        contador: 'publicações',
        wa: {
          titulo: 'Receba os relatórios e participe',
          texto: 'Junte-se ao canal de WhatsApp do IPPSE para receber os relatórios técnicos e as novidades do setor elétrico, e participar das iniciativas de participação cidadã.',
          cta: 'Entrar no canal de WhatsApp',
        },
      },
      prensa: {
        titulo: 'Imprensa e Novidades',
        descripcion: 'Comunicados de imprensa, aparições em mídia e agenda de eventos, fóruns e debates do IPPSE.',
        secciones: { comunicados: 'Comunicados de imprensa', medios: 'Aparições na mídia', eventos: 'Eventos, fóruns e debates' },
        notaEspanol: 'Os comunicados e seus textos completos são publicados em espanhol.',
        eventos: { proximos: 'Próximos', pasados: 'Realizados', vacio: 'Não há eventos programados no momento.' },
        contador: { comunicados: 'comunicados', apariciones: 'aparições' },
      },
      contacto: {
        titulo: 'Contato',
        descripcion: 'Fale com o Instituto de Profissionais Paraguaios do Setor Elétrico (IPPSE): consultas, imprensa e instituições.',
        cita: 'A soberania energética do Paraguai se constrói com planejamento de longo prazo, rigor técnico e a convergência do talento profissional do setor.',
        datos: { sede: 'Sede', email: 'E-mail', telefono: 'Telefone' },
        form: {
          srTitulo: 'Formulário de contato',
          avisoEnviado: 'Mensagem enviada. Responderemos o mais breve possível.',
          avisoError: 'Não foi possível enviar a mensagem. Verifique os dados ou escreva-nos diretamente para',
          consultaPlaceholder: 'Como podemos ajudar você?',
          consultaBoton: 'Enviar mensagem',
          nombre: 'Nome completo',
          nombrePlaceholder: 'Seu nome',
          email: 'E-mail',
          mensaje: 'Mensagem',
          honeypot: 'Não preencher',
          obligatorios: 'Campos obrigatórios',
          privacidad: 'Usamos seus dados apenas para responder você. Mais informações na',
          privacidadEnlace: 'política de privacidade',
          srNuevaPestana: '(abre em uma nova aba)',
        },
      },
    },
  },
};

export const usoI18n = (lang: Idioma) =>
  lang === 'es' ? null : diccionarios[lang];
