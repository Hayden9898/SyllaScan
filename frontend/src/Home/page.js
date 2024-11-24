import Button from 'components/Button'

export default function Home({ setScreen }) {
    return (
        <>
            <div className='wrapper-container'>
                <div className="about-container" style={{ width: 500 }}>
                    <div className="text-container">
                        <div className="title">Syllabus Scanner</div>
                        <i><div className="slogan-text">"Conquering Procrastination, one deadline at a time."</div></i>
                        <p className="about-text" >
                            The purpose of this application is to make scheduling important events in a student's course syllabus to ensure you never miss an important
                            assignment, quiz, test, mid-term, or any important class event. We also strive to give you constant reminders to start studying for tests
                            or complete assignments early, so you are always prepared.
                        </p>
                    </div>
                </div>
            </div>
            {/*implement about us*/}
            <div className='wrapper-container'>
                <div className='mx-auto justify-self-center'>
                    <Button onClick={() => { setScreen('drive') }}>
                        Continue to App
                    </Button>
                </div>
            </div>
        </>
    )
}