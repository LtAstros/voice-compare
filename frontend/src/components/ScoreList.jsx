function ScoreList({scores}) {
    const renderedList = scores.map(({url,score}) => {
        const id = crypto.randomUUID()
        return (
            <div className='grid grid-cols-4 gap-4' key={id}>
                <audio className="col-span-3 w-full" controls>
                            <source src={url} type="audio/wav"/>
                </audio>
                <h1 className="col-span-1 text-3xl font-bold text-slate-200 w-full text-center">{score.toFixed(2)}</h1>
            </div>
        )
    })

    return (
        <div className='grid grid-cols-1 gap-4 w-full items-center justify-center'>{renderedList}</div>
    )
}

export default ScoreList