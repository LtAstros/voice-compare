function ScoreItem({id,url,score}) {
    return (
        <div className='grid grid-cols-4 gap-4 w-full' key={id}>
            <audio className="col-span-3 w-full" controls>
                        <source src={url} type="audio/wav"/>
            </audio>
            <h1 className="col-span-1 text-3xl font-bold text-slate-200 w-full text-center">{typeof score === "number" ? score.toFixed(2) : ""}</h1>
        </div>
    )
}

export default ScoreItem