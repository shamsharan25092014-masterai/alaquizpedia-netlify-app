import Image from 'next/image';
import styles from './ExampleLesson.module.css';

export default function ExampleLesson() {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Image src="/duolingo_avatar.png" alt="Avatar" width={64} height={64} className={styles.avatar} />
        <h1 className={styles.title}>Spanish Basics</h1>
      </header>
      <section className={styles.lessonBox}>
        <p className={styles.question}>¿Cómo se dice "apple" en español?</p>
        <div className={styles.options}>
          <button className={styles.option}>Manzana</button>
          <button className={styles.option}>Pera</button>
          <button className={styles.option}>Uva</button>
        </div>
        <div className={styles.progress}>Progress: 1/5</div>
      </section>
    </div>
  );
}
