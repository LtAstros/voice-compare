import ScoreItem from "./ScoreItem"

function ScoreList({scores}) {
    const renderedList = scores.map(({url,score}) => {
        const id = crypto.randomUUID()
        return (
            <ScoreItem id={id} url={url} score={score}/>
        )
    })

    return (
        <div className='grid grid-cols-1 gap-4 w-full items-center justify-center'>{renderedList}</div>
    )
}

export default ScoreList