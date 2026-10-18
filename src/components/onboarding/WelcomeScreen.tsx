import React from 'react'
import { ArrowRight, Globe, ShieldCheck, Sparkles } from 'lucide-react'
import { BRAND } from '../../config/brand'
import { Button } from '../common/Button/Button'
import { CanvasContainer } from '../scenes/CanvasContainer'
import { getSceneConfig } from '../scenes/SceneRegistry'
import type { OnboardingAnswers } from '../../store/types'
import styles from './WelcomeScreen.module.css'

export interface WelcomeScreenProps {
  onStart: () => void
  answers: OnboardingAnswers
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart, answers }) => {
  const sceneConfig = getSceneConfig('welcome_scene')

  return (
    <main className={styles.wrapper}>
      <div className={styles.grid}>
        {/* Left Column: Headline and Immediate Interaction */}
        <section className={styles.content} aria-label="Welcome to BeyondNest">
          <div className={styles.badge}>
            <span className={styles.badgeDot} aria-hidden="true" />
            <span>{BRAND.welcome.badge}</span>
          </div>

          <h1 className={styles.headline}>
            <span className={styles.headlineGradient}>
              {BRAND.welcome.headline}
            </span>
          </h1>

          <p className={styles.supportingText}>
            {BRAND.welcome.supportingText}
          </p>

          <div className={styles.actions}>
            <div className={styles.buttonWrapper}>
              <Button
                variant="primary"
                size="lg"
                onClick={onStart}
                iconRight={<ArrowRight size={20} />}
                id="plan-my-move-button"
              >
                {BRAND.welcome.primaryButton}
              </Button>
            </div>
            <span className={styles.secondaryNote}>
              {BRAND.welcome.secondaryNote}
            </span>
          </div>

          <div className={styles.featureList}>
            <div className={styles.featureItem}>
              <Globe size={16} color="#0D9488" />
              <span>Worldwide Support</span>
            </div>
            <div className={styles.featureItem}>
              <Sparkles size={16} color="#0D9488" />
              <span>Interactive 3D Preview</span>
            </div>
            <div className={styles.featureItem}>
              <ShieldCheck size={16} color="#0D9488" />
              <span>No Sign-up Needed</span>
            </div>
          </div>
        </section>

        {/* Right Column: Progressive 3D Scene */}
        <aside className={styles.sceneArea} aria-label={BRAND.accessibility.globeLabel}>
          <CanvasContainer fallback={sceneConfig.renderFallback({ answers })}>
            {({ paused, reducedMotion }) =>
              sceneConfig.renderScene({ answers, paused, reducedMotion })
            }
          </CanvasContainer>
        </aside>
      </div>
    </main>
  )
}
