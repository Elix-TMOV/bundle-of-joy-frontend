export default function SetupComponent(props) {
    const { roomSocketId, handleStart, gameName, isHost, canStart } = props

    // Map game names to their respective assets and video IDs
    const gameAssets = {
        chess: {
            image: '/assets/Chess-Poster.png',
            videoId: "https://www.youtube.com/embed/fKxG8KjH1Qg?si=EeOkstwY7bOFWu6V"
        },
        shobu: {
            image: '/assets/Shobu-Poster.png',
            videoId: 'https://www.youtube.com/embed/qE8kyHyBlAo?si=Tf0TkwyEB5SlQpUk'
        },
        'fake-artist': {
            image: '/assets/Fake-Artist-Poster.png',
            videoId: "https://www.youtube.com/embed/HO_U97c8lgQ?si=SDNJu82bO6RN5Px3"
        }
    }

    const currentGame = gameAssets[gameName.toLowerCase()]

    return (
        <div className="relative h-full w-full flex flex-col">
            {/* Room Code Banner */}
            <div className="absolute top-4 right-4 z-10">
                <div className="flex items-center gap-2 bg-primary-blue rounded-lg p-3">
                    <span className="text-white font-medium">Room Code:</span>
                    <span className="bg-white px-3 py-1 rounded font-mono">{roomSocketId}</span>
                </div>
            </div>

            {/* Background Image */}
            <div 
                className="absolute inset-0 bg-no-repeat bg-cover bg-center"
                style={{ 
                    backgroundImage: `url('${currentGame.image}')`,
                    opacity: '0.8'
                }}
            />

            {/* Tutorial Video Container */}
            <div className="flex-1 flex justify-center items-center p-6 relative">
                <div className="w-1/2 relative z-10">
                    <div className="bg-primary-blue rounded-lg p-4 mb-4">
                        <h2 className="text-white text-xl font-semibold mb-2">How to Play {gameName}</h2>
                        <div className="relative pt-[56.25%]">
                            <iframe
                                className="absolute top-0 left-0 w-full h-full rounded-lg"
                                src={`${currentGame.videoId}`}
                                title={`How to play ${gameName}`}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />
                        </div>
                    </div>

                    {/* Start Button */}
                    {(isHost && canStart) && (
                        <button 
                            className="back-drop-button bg-primary-yellow font-semibold text-4xl rounded-md px-8 py-4 self-center w-full"
                            onClick={() => handleStart()}
                        >
                            Start Game
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}