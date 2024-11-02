/*
 * Project: ITU project - Garage sale website
 * @file ImageMaps.tsx

 * @brief ReactJS component for image maps (used in HomePage.tsx)

 * @author Neonila Mashlai - xmashl00
*/
import image1 from "./image1.webp";
import image2 from "./image2.webp";
import image3 from "./image3.webp";
import image4 from "./image4.webp";
import image5 from "./image5.webp";
import image6 from "./image6.webp";
import image7 from "./image7.webp";
import image8 from "./image8.webp";
import image9 from "./image9.webp";
import image10 from "./image10.webp";

type Image = {
    src: string;
    alt: string;
};

export const HomeImages: Image[] = [
    {
        src: image1,
        alt: "image1"
    },
    {
        src: image2,
        alt: "image2"
    },
    {
        src: image3,
        alt: "image3"
    },
    {
        src: image4,
        alt: "image4"
    },
    {
        src: image5,
        alt: "image5"
    },
    {
        src: image6,
        alt: "image6"
    },
    {
        src: image7,
        alt: "image7"
    },
    {
        src: image8,
        alt: "image8"
    },
    {
        src: image9,
        alt: "image9"
    },
    {
        src: image10,
        alt: "image10"
    }
];

export const MapImages = ({ images }: { images: Image[] }) => {
    return (
        <>
            {images.map((image, index) => (
                <img key={index} src={image.src} alt={image.alt} />
            ))}
        </>
    );
};
