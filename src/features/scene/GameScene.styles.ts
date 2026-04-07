import styled from 'styled-components'

export const ScenePage = styled.main`
  min-height: 100vh;
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(320px, 0.8fr);
  background:
    radial-gradient(circle at top left, rgba(83, 109, 254, 0.25), transparent 28%),
    radial-gradient(circle at bottom right, rgba(27, 198, 158, 0.18), transparent 24%),
    linear-gradient(135deg, #101218 0%, #0b1324 52%, #081018 100%);
  color: #edf2ff;

  @media (max-width: 960px) {
    grid-template-columns: 1fr;
  }
`

export const ScenePanel = styled.section`
  position: relative;
  min-height: 60vh;
  padding: clamp(1.25rem, 3vw, 2rem);

  @media (max-width: 960px) {
    min-height: 50vh;
  }
`

export const CanvasFrame = styled.div`
  position: relative;
  height: 100%;
  min-height: 420px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 28px;
  overflow: hidden;
  background:
    radial-gradient(circle at 50% 15%, rgba(122, 162, 255, 0.16), transparent 32%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.04), rgba(255, 255, 255, 0.02));
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.08),
    0 24px 80px rgba(0, 0, 0, 0.35);

  canvas {
    display: block;
  }
`

export const OverlayBadge = styled.p`
  position: absolute;
  top: 1rem;
  left: 1rem;
  z-index: 1;
  margin: 0;
  padding: 0.55rem 0.8rem;
  border-radius: 999px;
  background: rgba(10, 15, 28, 0.68);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #b8c8ff;
  font-size: 0.75rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
`

export const ContentPanel = styled.section`
  display: grid;
  align-content: center;
  gap: 1.5rem;
  padding: clamp(1.5rem, 4vw, 4rem);
`

export const Eyebrow = styled.p`
  margin: 0;
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #7ad2ff;
`

export const Heading = styled.h1`
  margin: 0;
  max-width: 12ch;
  font-size: clamp(2.8rem, 5vw, 5rem);
  line-height: 0.95;
  letter-spacing: -0.05em;
`

export const Lead = styled.p`
  margin: 0;
  max-width: 56ch;
  color: rgba(237, 242, 255, 0.78);
  font-size: 1rem;
  line-height: 1.7;
`

export const StatusGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.9rem;

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`

export const StatusCard = styled.article`
  padding: 1rem 1rem 1.1rem;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);

  h2 {
    margin: 0 0 0.35rem;
    font-size: 0.82rem;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: #9ab5ff;
  }

  p {
    margin: 0;
    color: rgba(237, 242, 255, 0.78);
    line-height: 1.5;
  }
`

export const InlineCode = styled.code`
  padding: 0.15rem 0.35rem;
  border-radius: 0.45rem;
  background: rgba(255, 255, 255, 0.08);
  color: #ffffff;
  font-family: 'SFMono-Regular', Consolas, monospace;
  font-size: 0.95em;
`