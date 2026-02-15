import { useEffect, useState } from 'react'

interface Props {
    score: number;
}

export default function SecurityScoreRing({ score }: Props) {
    const [animatedScore, setAnimatedScore] = useState(0)
    const radius = 48
    const circumference = 2 * Math.PI * radius
    const offset = circumference - (animatedScore / 100) * circumference

    useEffect(() => {
        const timer = setTimeout(() => setAnimatedScore(score), 300)
        return () => clearTimeout(timer)
    }, [score])

    const getColor = () => {
        if (score >= 80) return 'var(--accent-green)'
        if (score >= 60) return 'var(--accent-cyan)'
        if (score >= 40) return 'var(--accent-orange)'
        return 'var(--accent-red)'
    }

    return (
        <div className="score-ring-container animate-fade-in-up delay-100">
            <div className="score-ring">
                <svg width="120" height="120" viewBox="0 0 120 120">
                    <circle
                        className="score-ring-bg"
                        cx="60"
                        cy="60"
                        r={radius}
                    />
                    <circle
                        className="score-ring-fill"
                        cx="60"
                        cy="60"
                        r={radius}
                        stroke={getColor()}
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                    />
                </svg>
                <div className="score-ring-text">
                    <div className="score-value" style={{ color: getColor() }}>
                        {animatedScore}
                    </div>
                    <div className="score-label">Score</div>
                </div>
            </div>
        </div>
    )
}
