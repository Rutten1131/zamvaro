'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';
import type { Product } from '@/data/products';
import styles from './ProductFAQ.module.css';

interface Props {
  product: Product;
}

export default function ProductFAQ({ product }: Props) {
  if (!product.faqs || product.faqs.length === 0) return null;

  return (
    <section className={styles.section}>
      <div className="container">
        <div className={styles.header}>
          <span className="section-badge">❓ Ayuda</span>
          <h2 className="section-title">
            Preguntas <span className={styles.highlight}>Frecuentes</span>
          </h2>
          <p className="section-subtitle">
            Resolvemos tus dudas principales sobre el envío, métodos de pago y garantías.
          </p>
        </div>

        <div className={styles.faqList}>
          {product.faqs.map((faq, idx) => (
            <FaqItem key={idx} faq={faq} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FaqItem({ faq }: { faq: { question: string; answer: string } }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`${styles.item} ${isOpen ? styles.itemOpen : ''}`}>
      <button className={styles.trigger} onClick={() => setIsOpen(!isOpen)}>
        <span className={styles.question}>{faq.question}</span>
        <span className={styles.icon}>
          {isOpen ? <Minus size={18} /> : <Plus size={18} />}
        </span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className={styles.answerWrap}
          >
            <div className={styles.answerInner}>
              <p className={styles.answer}>{faq.answer}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
