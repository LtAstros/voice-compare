import { useState } from 'react'

function RecordingButton(props) {
    const [record, setRecord] = useState("start")

    console.log(props)

    return (
        <>
            <button className='rounded-lg bg-blue-700 hover:bg-blue-950 p-2 text-slate-200 text-xl'>Hello</button>
        </>
    );
}

export default RecordingButton
