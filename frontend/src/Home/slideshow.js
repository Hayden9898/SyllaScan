import React, {useState} from 'react';
import '../css/SelectableSlideshow.css';

import image1 from '../assets/1.PNG';
import image2 from '../assets/2.PNG';
import image3 from '../assets/3.PNG';
const Slideshow = () => {
    const [currentImg, setCurrentImg] = useState(image1);
    
    const [selectedId, setSelectedId] = useState(1);

    const slides = [
        {id: 1, label: 'Upload your Syllabi', description: 'Upload your course syllabuses from local files or Google Drive to get started', image: image1},
        {id: 2, label: 'Choose you preffered export platform', description: 'Choose your preferred platform to stay on top of your events', image: image2},
        {id: 3, label: 'Get a preview', description: 'Review and upload your schedule with ease', image: image3},
    ];


    return(
        <div className='slideshow-container'>
            <div className='options'>
                {slides.map((slide) => (
                    <button 
                        key={slide.id}
                        className={`option-button ${selectedId === slide.id ? 'selected' : ''}`}
                        onClick={() => {
                            setCurrentImg(slide.image);
                            setSelectedId(slide.id);
                            }   
                        }
                        >
                    <strong>{slide.label}</strong>
                    <p>{slide.description}</p>
                    </button>
                ))}
            </div>
            <div className='image-display'>
                <img src={currentImg} className='slideshow-image' alt="Selected Image"></img>
            </div>
        </div>
    );
};

export default Slideshow;