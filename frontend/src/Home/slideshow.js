import React, {useState} from 'react';
import '../css/SelectableSlideshow.css';

const Slideshow = () => {
    const [currentImg, setCurrentImg] = useState("https://cdn.pixabay.com/photo/2015/04/04/19/13/one-706897_1280.jpg");
    
    const [selectedId, setSelectedId] = useState(1);

    const slides = [
        {id: 1, label: 'image 1', description: 'Description 1', image:'https://cdn.pixabay.com/photo/2015/04/04/19/13/one-706897_1280.jpg'},
        {id: 2, label: 'image 2', description: 'Description 2', image:'https://cdn.pixabay.com/photo/2015/04/04/19/13/two-706896_1280.jpg'},
        {id: 3, label: 'image 3', description: 'Description 3',image:'https://cdn.pixabay.com/photo/2015/04/04/19/13/three-706895_1280.jpg'},
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