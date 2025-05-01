import { ImageResponse } from 'next/og';

// App router includes @vercel/og.
// No need to install it.

export const runtime = 'edge';

export async function GET() {
    return new ImageResponse(
        (
            <div
                style={{
                    fontSize: 60,
                    color: 'black',
                    background: 'white',
                    width: '100%',
                    height: '100%',
                    padding: '50px 100px',
                    textAlign: 'center',
                    justifyContent: 'center',
                    alignItems: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                <div style={{ marginBottom: '20px' }}>🚀</div>
                <div>Interview Prep Platform</div>
                <div style={{ fontSize: 30, marginTop: '20px', color: 'dimgray' }}>
                    Ace your next technical interview.
                </div>
            </div>
        ),
        {
            width: 1200,
            height: 630,
        },
    );
}
