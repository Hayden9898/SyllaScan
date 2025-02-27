import Button from 'components/Button'
import Slideshow from './slideshow'
import { Link } from 'react-router-dom'
import { FaArrowRight } from 'react-icons/fa'

export default function Home() {
    return (
        <>
            <div className='header-columns'>
                <div className='title-col'>
                    <div className="title">Syllabus Scanner
                        <i><div className="slogan-text">"Conquering Procrastination, one deadline at a time."</div></i>
                    </div>
                    <Link to="/upload">
                        <Button className='flex gap-2'>
                            Continue to App
                            <FaArrowRight size={20} className='font-thin' />
                        </Button>
                    </Link>
                </div>
                <div className='title-col'>
                    <div className="img-box">
                        <img src="https://thumbs.dreamstime.com/b/time-management-businesswoman-sitting-bulb-productivity-concept-business-vector-illustration-flat-cartoon-isolate-153871350.jpg"></img>
                    </div>
                </div>
            </div>
            <svg className='wave' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
                <defs>
                    <pattern id="imagePattern" patternUnits="userSpaceOnUse" width="100%" height="100%">
                        <image
                            xlinkHref='https://preview.redd.it/3tgcrfk5o5t11.png?width=1920&format=png&auto=webp&s=a46b80d727f91d126ef03c80565045f73eb72b7c'
                            x="0"
                            y="0"
                            width="1440"
                            height="320"
                            preserveAspectRatio="none"
                        />
                    </pattern>
                </defs>
                <path fill="url(#imagePattern)" fillOpacity="1" d="M0,288L60,266.7C120,245,240,203,360,197.3C480,192,600,224,720,240C840,256,960,256,1080,250.7C1200,245,1320,235,1380,229.3L1440,224L1440,0L1380,0C1320,0,1200,0,1080,0C960,0,840,0,720,0C600,0,480,0,360,0C240,0,120,0,60,0L0,0Z">
                </path>
            </svg>
            {/*implement about us*/}
            <div className='about-section'>
                <div className='aboutUs-background'>
                    <div className='one-column'>
                        <div className='intro-title'>
                            <p>What we do</p>
                            <div className='intro-subtitle'>
                                <p>Boost Overall Productivity</p>
                            </div>
                            <div className='sub-paragraph'>
                                <p>Effortless to use, powerful in action. Let AI help you stay on top of your classes, assignments, quizzes, and tests</p>
                            </div>
                        </div>
                    </div>
                </div>
                <section id="features">
                    <div className='slideshow'>
                        <Slideshow />
                    </div>
                </section>
            </div>
        </>
    )
}