import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowLeft, ArrowRight, Check, FileText, Paperclip, X } from 'lucide-react'
import { MESSENGERS, SERVICES, TIMES } from './data'

const STEP_TITLES = ['Услуга', 'Дата и связь', 'Причина', 'Контакты']
const WEEKDAYS = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб']
const MONTHS = ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек']

function nextDays(n = 14) {
  const out = []
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  while (out.length < n) {
    d.setDate(d.getDate() + 1)
    if (d.getDay() !== 0) out.push(new Date(d))
  }
  return out
}

const fmtPrice = (p) => p.toLocaleString('ru-RU') + ' ₽'

export default function Booking({ preset, onPresetUsed }) {
  const [step, setStep] = useState(0)
  const [dir, setDir] = useState(1)
  const [done, setDone] = useState(false)
  const [errors, setErrors] = useState({})
  const [form, setForm] = useState({
    service: 'first', date: null, time: '', messenger: 'Telegram',
    reason: '', files: [], name: '', phone: '', email: '', consent: false,
  })
  const fileRef = useRef(null)
  const days = useMemo(() => nextDays(14), [])

  useEffect(() => {
    if (!preset) return
    setForm((f) => ({ ...f, service: preset }))
    setStep(0)
    setDone(false)
    onPresetUsed?.()
  }, [preset, onPresetUsed])

  const set = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }))
    setErrors((e) => ({ ...e, [k]: undefined }))
  }

  const validate = (s) => {
    const e = {}
    if (s === 1) {
      if (!form.date) e.date = 'Выберите день'
      if (!form.time) e.time = 'Выберите интервал'
    }
    if (s === 2 && form.reason.trim().length < 10) e.reason = 'Опишите ситуацию хотя бы в паре предложений'
    if (s === 3) {
      if (form.name.trim().length < 2) e.name = 'Как к вам обращаться?'
      if (form.phone.replace(/\D/g, '').length < 10) e.phone = 'Укажите номер полностью'
      if (!form.consent) e.consent = 'Нужно согласие на обработку данных'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const next = () => {
    if (!validate(step)) return
    if (step === 3) { setDone(true); return }
    setDir(1); setStep((s) => s + 1)
  }
  const back = () => { setDir(-1); setStep((s) => Math.max(0, s - 1)) }

  const addFiles = (list) => {
    const arr = Array.from(list || [])
    set('files', [...form.files, ...arr].slice(0, 10))
  }

  const service = SERVICES.find((s) => s.id === form.service)

  const variants = {
    enter: (d) => ({ opacity: 0, x: d * 40 }),
    center: { opacity: 1, x: 0 },
    exit: (d) => ({ opacity: 0, x: d * -40 }),
  }

  if (done) {
    return (
      <motion.div className="booking booking--done" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}>
        <motion.div className="done-icon" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 16, delay: 0.1 }}>
          <Check size={34} strokeWidth={2.5} />
        </motion.div>
        <h3>Заявка принята</h3>
        <p>
          {form.name.split(' ')[0]}, спасибо. Я напишу вам в {form.messenger}{' '}
          {form.date && `${form.date.getDate()} ${MONTHS[form.date.getMonth()]}`} в интервале {form.time}, чтобы согласовать точное время.
        </p>
        <div className="done-summary">
          <span>{service.title}</span><span>{fmtPrice(service.price)}</span>
        </div>
        <button className="btn btn--ghost" onClick={() => { setDone(false); setStep(0); setForm((f) => ({ ...f, reason: '', files: [], date: null, time: '' })) }}>
          Отправить ещё одну заявку
        </button>
      </motion.div>
    )
  }

  return (
    <div className="booking">
      <div className="booking-head">
        <div className="booking-steps" role="list">
          {STEP_TITLES.map((t, i) => (
            <div key={t} role="listitem" className={`bstep ${i === step ? 'is-active' : ''} ${i < step ? 'is-done' : ''}`}>
              <span className="bstep-dot">{i < step ? <Check size={13} strokeWidth={3} /> : i + 1}</span>
              <span className="bstep-label">{t}</span>
            </div>
          ))}
        </div>
        <div className="booking-progress"><motion.span animate={{ width: `${((step + 1) / 4) * 100}%` }} transition={{ type: 'spring', stiffness: 120, damping: 20 }} /></div>
      </div>

      <div className="booking-body">
        <AnimatePresence mode="wait" custom={dir} initial={false}>
          <motion.div key={step} custom={dir} variants={variants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}>
            {step === 0 && (
              <fieldset>
                <legend>Выберите услугу</legend>
                <div className="opt-list">
                  {SERVICES.map((s) => (
                    <label key={s.id} className={`opt ${form.service === s.id ? 'is-on' : ''}`}>
                      <input type="radio" name="service" checked={form.service === s.id} onChange={() => set('service', s.id)} />
                      <span className="opt-main">
                        <b>{s.title}</b>
                        <small>{s.note}</small>
                      </span>
                      <span className="opt-price">{fmtPrice(s.price)}</span>
                    </label>
                  ))}
                  <div className="opt opt--free">
                    <span className="opt-main"><b>Вопрос после обращения</b><small>Если я рекомендовала написать повторно</small></span>
                    <span className="opt-price">бесплатно</span>
                  </div>
                </div>
              </fieldset>
            )}

            {step === 1 && (
              <fieldset>
                <legend>Удобный день</legend>
                <div className="days">
                  {days.map((d) => {
                    const on = form.date && d.getTime() === form.date.getTime()
                    return (
                      <button type="button" key={d.toISOString()} className={`day ${on ? 'is-on' : ''}`} onClick={() => set('date', d)}>
                        <small>{WEEKDAYS[d.getDay()]}</small>
                        <b>{d.getDate()}</b>
                        <small>{MONTHS[d.getMonth()]}</small>
                      </button>
                    )
                  })}
                </div>
                {errors.date && <p className="err">{errors.date}</p>}

                <legend className="mt">Интервал (по Москве)</legend>
                <div className="chips">
                  {TIMES.map((t) => (
                    <button type="button" key={t} className={`chip ${form.time === t ? 'is-on' : ''}`} onClick={() => set('time', t)}>{t}</button>
                  ))}
                </div>
                {errors.time && <p className="err">{errors.time}</p>}

                <legend className="mt">Мессенджер</legend>
                <div className="chips">
                  {MESSENGERS.map((m) => (
                    <button type="button" key={m} className={`chip ${form.messenger === m ? 'is-on' : ''}`} onClick={() => set('messenger', m)}>{m}</button>
                  ))}
                </div>
              </fieldset>
            )}

            {step === 2 && (
              <fieldset>
                <legend>Что вас беспокоит?</legend>
                <textarea
                  rows={5}
                  maxLength={1500}
                  placeholder="Например: в анализе снижен гемоглобин до 98, ферритин 6. Беспокоит слабость и выпадение волос. Принимаю..."
                  value={form.reason}
                  onChange={(e) => set('reason', e.target.value)}
                  aria-invalid={!!errors.reason}
                />
                <div className="count">{form.reason.length}/1500</div>
                {errors.reason && <p className="err">{errors.reason}</p>}

                <div
                  className="drop"
                  onClick={() => fileRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => { e.preventDefault(); addFiles(e.dataTransfer.files) }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && fileRef.current?.click()}
                >
                  <Paperclip size={20} />
                  <span><b>Прикрепите анализы</b> — фото или PDF, до 10 файлов</span>
                  <input ref={fileRef} type="file" multiple accept="image/*,.pdf" hidden onChange={(e) => addFiles(e.target.files)} />
                </div>
                <AnimatePresence>
                  {form.files.map((f, i) => (
                    <motion.div key={f.name + i} className="file" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                      <FileText size={16} /> <span>{f.name}</span>
                      <button type="button" aria-label="Удалить файл" onClick={() => set('files', form.files.filter((_, j) => j !== i))}><X size={15} /></button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </fieldset>
            )}

            {step === 3 && (
              <fieldset>
                <legend>Как с вами связаться</legend>
                <div className="fields">
                  <label className="field">
                    <span>Имя</span>
                    <input value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Анна" aria-invalid={!!errors.name} />
                    {errors.name && <em className="err">{errors.name}</em>}
                  </label>
                  <label className="field">
                    <span>Телефон ({form.messenger})</span>
                    <input type="tel" value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="+7 900 000-00-00" aria-invalid={!!errors.phone} />
                    {errors.phone && <em className="err">{errors.phone}</em>}
                  </label>
                  <label className="field field--wide">
                    <span>Email (необязательно)</span>
                    <input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="anna@mail.ru" />
                  </label>
                </div>
                <label className={`consent ${errors.consent ? 'has-err' : ''}`}>
                  <input type="checkbox" checked={form.consent} onChange={(e) => set('consent', e.target.checked)} />
                  <span>Соглашаюсь на обработку персональных данных, принимаю политику конфиденциальности и условия оферты</span>
                </label>
                {errors.consent && <p className="err">{errors.consent}</p>}
                <div className="summary">
                  <div><small>Услуга</small><b>{service.title}</b></div>
                  <div><small>Когда</small><b>{form.date ? `${form.date.getDate()} ${MONTHS[form.date.getMonth()]}, ${form.time}` : '—'}</b></div>
                  <div><small>Стоимость</small><b>{fmtPrice(service.price)}</b></div>
                </div>
              </fieldset>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="booking-foot">
        <span className="booking-count">Шаг {step + 1} из 4</span>
        <div className="booking-btns">
          {step > 0 && (
            <button type="button" className="btn btn--ghost" onClick={back}><ArrowLeft size={16} /> Назад</button>
          )}
          <button type="button" className="btn btn--primary" onClick={next}>
            {step === 3 ? 'Отправить заявку' : 'Далее'} <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}
