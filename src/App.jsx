import { useEffect, useRef, useState } from 'react'
import {
  AnimatePresence, MotionConfig, motion, useMotionValueEvent, useScroll, useSpring, useTransform,
} from 'motion/react'
import { ArrowRight, ArrowUpRight, Menu, Minus, Plus, Send, Phone, Mail, MapPin, ChevronLeft, ChevronRight } from 'lucide-react'
import Booking from './Booking'
import { DIRECTIONS, DOCTOR, EDUCATION, FAQ, REVIEWS, SERVICES, STEPS, TOPICS } from './data'

const ease = [0.16, 1, 0.3, 1]

function Reveal({ children, delay = 0, className, as = 'div' }) {
  const M = motion[as]
  return (
    <M
      className={className}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.7, ease, delay }}
    >
      {children}
    </M>
  )
}

function Header({ onBook }) {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const { scrollY } = useScroll()
  useMotionValueEvent(scrollY, 'change', (v) => setScrolled(v > 24))
  const links = [
    ['#directions', 'Направления'], ['#how', 'Как проходит'], ['#prices', 'Стоимость'],
    ['#about', 'Обо мне'], ['#faq', 'Вопросы'], ['#contacts', 'Контакты'],
  ]
  return (
    <header className={`header ${scrolled ? 'is-scrolled' : ''}`}>
      <div className="container header-in">
        <a href="#top" className="brand" aria-label="На главную">
          <svg viewBox="0 0 32 32" width="28" height="28" aria-hidden="true"><circle cx="16" cy="16" r="13" fill="currentColor" /><circle cx="16" cy="16" r="5" fill="var(--bg)" /></svg>
          <span><b>Е. С. Кузнецова</b><small>гематолог</small></span>
        </a>
        <nav className="nav" aria-label="Основная навигация">
          {links.map(([h, t]) => <a key={h} href={h}>{t}</a>)}
        </nav>
        <button className="btn btn--primary btn--sm header-cta" onClick={onBook}>Записаться</button>
        <button className="burger" aria-label="Меню" aria-expanded={open} onClick={() => setOpen((o) => !o)}><Menu size={22} /></button>
      </div>
      <AnimatePresence>
        {open && (
          <motion.nav className="mnav" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
            {links.map(([h, t]) => <a key={h} href={h} onClick={() => setOpen(false)}>{t}</a>)}
            <button className="btn btn--primary" onClick={() => { setOpen(false); onBook() }}>Записаться онлайн</button>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  )
}

function Cells() {
  const cells = [
    { s: 120, x: '-8%', y: '8%', d: 0 }, { s: 70, x: '82%', y: '-4%', d: 1.2 },
    { s: 54, x: '90%', y: '62%', d: 0.6 }, { s: 90, x: '-12%', y: '72%', d: 1.8 }, { s: 36, x: '70%', y: '88%', d: 2.4 },
  ]
  return cells.map((c, i) => (
    <motion.div
      key={i}
      className="cell"
      style={{ width: c.s, height: c.s, left: c.x, top: c.y }}
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: 1, scale: 1, y: [0, -14, 0], rotate: [0, 8, 0] }}
      transition={{ opacity: { duration: 0.8, delay: 0.4 + i * 0.1 }, scale: { duration: 0.8, delay: 0.4 + i * 0.1 }, y: { duration: 6 + i, repeat: Infinity, ease: 'easeInOut', delay: c.d }, rotate: { duration: 8 + i, repeat: Infinity, ease: 'easeInOut' } }}
      aria-hidden="true"
    />
  ))
}

function Counter({ to, suffix = '' }) {
  const ref = useRef(null)
  const [val, setVal] = useState(0)
  useEffect(() => {
    const el = ref.current
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return
      io.disconnect()
      const t0 = performance.now()
      const tick = (t) => {
        const p = Math.min(1, (t - t0) / 1400)
        setVal(Math.round(to * (1 - Math.pow(1 - p, 3))))
        if (p < 1) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    })
    io.observe(el)
    return () => io.disconnect()
  }, [to])
  return <span ref={ref}>{val.toLocaleString('ru-RU')}{suffix}</span>
}

function Hero({ onBook }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const imgY = useTransform(scrollYProgress, [0, 1], [0, 80])
  const words = 'Разберёмся в анализах крови — спокойно и по делу'.split(' ')
  return (
    <section className="hero" id="top" ref={ref}>
      <div className="container hero-in">
        <div className="hero-text">
          <motion.p className="kicker" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>
            <span className="pulse" /> Онлайн-информирование и очные приёмы
          </motion.p>
          <h1 className="hero-title">
            {words.map((w, i) => (
              <span key={i}>
                <span className="word">
                  <motion.span initial={{ y: '110%' }} animate={{ y: 0 }} transition={{ duration: 0.8, ease, delay: 0.1 + i * 0.06 }}>
                    {w === 'спокойно' ? <em>{w}</em> : w}
                  </motion.span>
                </span>{' '}
              </span>
            ))}
          </h1>
          <motion.p className="hero-lead" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease, delay: 0.7 }}>
            {DOCTOR.name} — врач-гематолог, кандидат медицинских наук. Помогаю понять, что происходит с кровью, и составить
            понятный план действий. В Telegram, WhatsApp, VK или Max — из любого города.
          </motion.p>
          <motion.div className="hero-cta" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease, delay: 0.85 }}>
            <button className="btn btn--primary btn--lg" onClick={onBook}>Записаться онлайн <ArrowRight size={18} /></button>
            <a className="btn btn--ghost btn--lg" href="#prices">Стоимость</a>
          </motion.div>
          <motion.dl className="stats" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.05, duration: 0.8 }}>
            <div><dt><Counter to={13} /></dt><dd>лет в гематологии</dd></div>
            <div><dt><Counter to={4200} suffix="+" /></dt><dd>пациентов</dd></div>
            <div><dt>к.м.н.</dt><dd>кандидат наук</dd></div>
          </motion.dl>
        </div>
        <div className="hero-media">
          <Cells />
          <motion.div className="hero-photo" style={{ y: imgY }} initial={{ clipPath: 'inset(100% 0 0 0 round 200px 200px 24px 24px)' }} animate={{ clipPath: 'inset(0% 0 0 0 round 200px 200px 24px 24px)' }} transition={{ duration: 1.2, ease, delay: 0.2 }}>
            <img src="img/doctor.jpg" alt="Елена Сергеевна Кузнецова, врач-гематолог, в белом халате" width="800" height="1200" />
          </motion.div>
          <motion.div className="badge" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1.2, type: 'spring', stiffness: 200, damping: 18 }}>
            <span className="badge-dot" />
            <span><b>Ближайшая запись</b><small>завтра, 12:00–15:00</small></span>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

function Marquee() {
  const row = [...TOPICS, ...TOPICS]
  return (
    <div className="marquee" aria-hidden="true">
      <motion.div className="marquee-track" animate={{ x: ['0%', '-50%'] }} transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}>
        {row.map((t, i) => <span key={i}>{t}<i /></span>)}
      </motion.div>
    </div>
  )
}

function Intro() {
  return (
    <section className="section intro">
      <div className="container intro-in">
        <Reveal className="intro-img"><img src="img/online.jpg" alt="Смартфон с перепиской и бланк анализа крови на столе" loading="lazy" /></Reveal>
        <div>
          <Reveal as="p" className="eyebrow">Что такое онлайн-информирование</Reveal>
          <Reveal as="h2" className="h2" delay={0.05}>Врач рядом, даже если до клиники — сотни километров</Reveal>
          <Reveal as="p" className="body" delay={0.1}>
            Это дистанционное общение по теме гематологии в текстовом формате. Вы присылаете анализы и описываете ситуацию — я
            разбираю каждое значение, задаю уточняющие вопросы и объясняю, что делать дальше.
          </Reveal>
          <Reveal className="note" delay={0.15}>
            Онлайн-информирование не является медицинской консультацией и не заменяет очный приём врача.
          </Reveal>
        </div>
      </div>
    </section>
  )
}

function Directions() {
  return (
    <section className="section" id="directions">
      <div className="container">
        <div className="sec-head">
          <Reveal as="p" className="eyebrow">С чем я помогаю</Reveal>
          <Reveal as="h2" className="h2" delay={0.05}>Направления работы</Reveal>
        </div>
        <div className="dir-grid">
          {DIRECTIONS.map((d, i) => (
            <motion.article
              key={d.n}
              className="dir"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.6, ease, delay: (i % 3) * 0.08 }}
              whileHover={{ y: -6 }}
            >
              <span className="dir-n">{d.n}</span>
              <h3>{d.title}</h3>
              <p>{d.text}</p>
              <ArrowUpRight className="dir-arrow" size={20} />
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}

function How() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 70%', 'end 60%'] })
  const h = useSpring(scrollYProgress, { stiffness: 90, damping: 24 })
  return (
    <section className="section how" id="how">
      <div className="container how-in">
        <div className="how-side">
          <Reveal as="p" className="eyebrow">Как проходит</Reveal>
          <Reveal as="h2" className="h2" delay={0.05}>Четыре шага от заявки до плана</Reveal>
          <Reveal as="p" className="body" delay={0.1}>Без очередей и дороги. Вся переписка остаётся у вас — к ней можно вернуться в любой момент.</Reveal>
        </div>
        <ol className="steps" ref={ref}>
          <div className="steps-line"><motion.span style={{ scaleY: h }} /></div>
          {STEPS.map((s, i) => (
            <motion.li
              key={s.title}
              initial={{ opacity: 0.25 }}
              whileInView={{ opacity: 1 }}
              viewport={{ margin: '-45% 0px -45% 0px' }}
              transition={{ duration: 0.4 }}
            >
              <span className="step-n">{i + 1}</span>
              <div><h3>{s.title}</h3><p>{s.text}</p></div>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  )
}

function Prices({ onBook }) {
  return (
    <section className="section prices" id="prices">
      <div className="container">
        <div className="sec-head">
          <Reveal as="p" className="eyebrow">Стоимость</Reveal>
          <Reveal as="h2" className="h2" delay={0.05}>Прозрачные цены, без доплат</Reveal>
        </div>
        <div className="price-grid">
          {SERVICES.map((s, i) => (
            <motion.div
              key={s.id}
              className={`price ${s.accent ? 'price--accent' : ''}`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease, delay: i * 0.08 }}
            >
              <h3>{s.title}</h3>
              <p className="price-note">{s.note}</p>
              <p className="price-val">{s.price.toLocaleString('ru-RU')} <span>₽</span></p>
              <ul>{s.features.map((f) => <li key={f}>{f}</li>)}</ul>
              <button className={`btn ${s.accent ? 'btn--light' : 'btn--primary'}`} onClick={() => onBook(s.id)}>Записаться <ArrowRight size={16} /></button>
            </motion.div>
          ))}
        </div>
        <Reveal className="free-line">
          <b>Вопрос после обращения — бесплатно,</b> если я рекомендовала связаться повторно с новыми результатами анализов.
        </Reveal>
      </div>
    </section>
  )
}

function BookingSection({ preset, clearPreset }) {
  return (
    <section className="section book" id="book">
      <div className="container book-in">
        <div className="book-side">
          <Reveal as="p" className="eyebrow eyebrow--light">Запись онлайн</Reveal>
          <Reveal as="h2" className="h2" delay={0.05}>Оставьте заявку — я напишу вам сама</Reveal>
          <Reveal as="p" className="body" delay={0.1}>
            В выбранный день я свяжусь с вами в удобном мессенджере, согласую точное время по Москве и пришлю реквизиты для оплаты.
          </Reveal>
          <Reveal as="ul" className="book-list" delay={0.15}>
            <li>Отвечаю лично, без операторов</li>
            <li>Можно приложить до 10 файлов</li>
            <li>Данные защищены и не передаются третьим лицам</li>
          </Reveal>
        </div>
        <Reveal delay={0.1}><Booking preset={preset} onPresetUsed={clearPreset} /></Reveal>
      </div>
    </section>
  )
}

function About() {
  return (
    <section className="section about" id="about">
      <div className="container about-in">
        <div className="about-text">
          <Reveal as="p" className="eyebrow">Обо мне</Reveal>
          <Reveal as="h2" className="h2" delay={0.05}>{DOCTOR.name}</Reveal>
          <Reveal as="p" className="body" delay={0.1}>
            {DOCTOR.role}, кандидат медицинских наук. Член Национального гематологического общества и Европейской гематологической
            ассоциации (EHA). Работаю по клиническим рекомендациям и принципам доказательной медицины.
          </Reveal>
          <Reveal as="blockquote" className="quote" delay={0.15}>
            «Большинство изменений в анализах объяснимы и поправимы. Моя задача — найти причину, а не просто снизить цифру».
          </Reveal>
          <ul className="timeline">
            {EDUCATION.map((e, i) => (
              <motion.li key={e.year} initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, ease, delay: i * 0.07 }}>
                <span>{e.year}</span><p>{e.text}</p>
              </motion.li>
            ))}
          </ul>
        </div>
        <Reveal className="about-img" delay={0.1}>
          <img src="img/tube.jpg" alt="Пробирка с кровью на льняной ткани в мягком свете" loading="lazy" />
        </Reveal>
      </div>
    </section>
  )
}

function Reviews() {
  const [i, setI] = useState(0)
  const [dir, setDir] = useState(1)
  const go = (d) => { setDir(d); setI((p) => (p + d + REVIEWS.length) % REVIEWS.length) }
  useEffect(() => {
    const t = setInterval(() => go(1), 7000)
    return () => clearInterval(t)
  }, [i])
  const r = REVIEWS[i]
  return (
    <section className="section reviews">
      <div className="container">
        <div className="sec-head sec-head--row">
          <div>
            <Reveal as="p" className="eyebrow">Отзывы</Reveal>
            <Reveal as="h2" className="h2" delay={0.05}>Что говорят пациенты</Reveal>
          </div>
          <div className="rev-ctrl">
            <button aria-label="Предыдущий отзыв" onClick={() => go(-1)}><ChevronLeft size={20} /></button>
            <span>{i + 1} / {REVIEWS.length}</span>
            <button aria-label="Следующий отзыв" onClick={() => go(1)}><ChevronRight size={20} /></button>
          </div>
        </div>
        <div className="rev-stage">
          <AnimatePresence mode="wait" custom={dir}>
            <motion.figure
              key={i}
              className="rev"
              custom={dir}
              initial={{ opacity: 0, x: dir * 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: dir * -60 }}
              transition={{ duration: 0.45, ease }}
            >
              <blockquote>«{r.text}»</blockquote>
              <figcaption><b>{r.name}</b><span>{r.topic}</span></figcaption>
            </motion.figure>
          </AnimatePresence>
        </div>
        <div className="rev-dots">
          {REVIEWS.map((_, k) => (
            <button key={k} aria-label={`Отзыв ${k + 1}`} className={k === i ? 'is-on' : ''} onClick={() => { setDir(k > i ? 1 : -1); setI(k) }} />
          ))}
        </div>
      </div>
    </section>
  )
}

function Faq() {
  const [open, setOpen] = useState(0)
  return (
    <section className="section faq" id="faq">
      <div className="container faq-in">
        <div>
          <Reveal as="p" className="eyebrow">Вопросы</Reveal>
          <Reveal as="h2" className="h2" delay={0.05}>Частые вопросы</Reveal>
        </div>
        <div className="acc">
          {FAQ.map((f, i) => {
            const on = open === i
            return (
              <div key={f.q} className={`acc-item ${on ? 'is-on' : ''}`}>
                <button className="acc-q" aria-expanded={on} onClick={() => setOpen(on ? -1 : i)}>
                  <span>{f.q}</span>
                  <span className="acc-ico">{on ? <Minus size={18} /> : <Plus size={18} />}</span>
                </button>
                <AnimatePresence initial={false}>
                  {on && (
                    <motion.div className="acc-a" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.35, ease }}>
                      <p>{f.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function Contacts({ onBook }) {
  return (
    <section className="section contacts" id="contacts">
      <div className="container">
        <Reveal className="contact-card">
          <div>
            <p className="eyebrow eyebrow--light">Контакты</p>
            <h2 className="h2">Не знаете, с чего начать?</h2>
            <p className="body">Напишите пару строк о том, что вас беспокоит. Я предложу свободное время и расскажу, как проходит встреча. Отвечаю сама, обычно в течение дня.</p>
            <div className="msg-row">
              {['Telegram', 'WhatsApp', 'VK', 'Max'].map((m) => (
                <motion.a key={m} href="#book" onClick={(e) => { e.preventDefault(); onBook() }} whileHover={{ y: -3 }} whileTap={{ scale: 0.97 }}>
                  <Send size={15} /> {m}
                </motion.a>
              ))}
            </div>
          </div>
          <ul className="contact-list">
            <li><Phone size={18} /><span><small>Телефон</small><a href={`tel:${DOCTOR.phone.replace(/[^+\d]/g, '')}`}>{DOCTOR.phone}</a></span></li>
            <li><Mail size={18} /><span><small>Почта</small><a href={`mailto:${DOCTOR.email}`}>{DOCTOR.email}</a></span></li>
            <li><MapPin size={18} /><span><small>Очный приём</small>Москва, ул. Пречистенка, 17 — клиника «Здоровье+»</span></li>
          </ul>
        </Reveal>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-in">
        <p>© {new Date().getFullYear()} {DOCTOR.name}. Врач-гематолог.</p>
        <nav aria-label="Документы">
          <a href="#">Политика конфиденциальности</a>
          <a href="#">Оферта</a>
        </nav>
        <p className="footer-warn">Имеются противопоказания. Необходима консультация специалиста. WhatsApp принадлежит компании Meta, признанной экстремистской и запрещённой в РФ.</p>
      </div>
    </footer>
  )
}

function ScrollBar() {
  const { scrollYProgress } = useScroll()
  const x = useSpring(scrollYProgress, { stiffness: 140, damping: 30 })
  return <motion.div className="scrollbar" style={{ scaleX: x }} />
}

export default function App() {
  const [preset, setPreset] = useState(null)
  const book = (id) => {
    if (typeof id === 'string') setPreset(id)
    document.getElementById('book')?.scrollIntoView({ behavior: 'smooth' })
  }
  return (
    <MotionConfig reducedMotion="user">
      <ScrollBar />
      <Header onBook={() => book()} />
      <main>
        <Hero onBook={() => book()} />
        <Marquee />
        <Intro />
        <Directions />
        <How />
        <Prices onBook={book} />
        <BookingSection preset={preset} clearPreset={() => setPreset(null)} />
        <About />
        <Reviews />
        <Faq />
        <Contacts onBook={() => book()} />
      </main>
      <Footer />
    </MotionConfig>
  )
}
