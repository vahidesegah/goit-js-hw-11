import React, { useState, useEffect } from "react";
import axios from "axios";
import iziToast from "izitoast";
import "izitoast/dist/css/iziToast.min.css";
import SimpleLightbox from "simplelightbox";
import "simplelightbox/dist/simple-lightbox.min.css";
import Loader from "./Loader";

const PIXABAY_API_KEY = "11263184-2511e204268bc5cc29e1c41a8";
const PIXABAY_BASE_URL = "https://pixabay.com/api/";

const ImageGallery = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lightbox, setLightbox] = useState(null);

  useEffect(() => {
    if (images.length > 0) {
      if (lightbox) {
        lightbox.refresh();
      } else {
        const newLightbox = new SimpleLightbox(".gallery a", {
          captionsData: "alt",
          captionDelay: 250,
          showCounter: true,
        });
        setLightbox(newLightbox);
      }
    }

    return () => {
      if (lightbox) {
        lightbox.destroy();
      }
    };
  }, [images]);

  const handleSearch = async (e) => {
    e.preventDefault();

    if (!searchQuery.trim()) {
      iziToast.warning({
        title: "Warning",
        message: "Please enter a search term",
        position: "topRight",
      });
      return;
    }

    setLoading(true);
    setImages([]);

    try {
      const response = await axios.get(PIXABAY_BASE_URL, {
        params: {
          key: PIXABAY_API_KEY,
          q: searchQuery,
          image_type: "photo",
          orientation: "horizontal",
          safesearch: true,
          per_page: 40,
        },
      });

      if (response.data.hits.length === 0) {
        iziToast.info({
          title: "No Results",
          message:
            "Sorry, there are no images matching your search query. Please try again!",
          position: "topRight",
        });
        return;
      }

      setImages(response.data.hits);
    } catch (error) {
      iziToast.error({
        title: "Error",
        message: "An error occurred while fetching images. Please try again.",
        position: "topRight",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full px-4">
      <form onSubmit={handleSearch} className="mb-8 pt-8">
        <div className="flex gap-2 justify-center">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search images..."
            className="p-2 border border-gray-300 rounded"
            required
          />
          <button
            class="buton"
            type="submit"
            className="px-6 py-2 bg-blue-500 text-white rounded"
          >
            Search
          </button>
        </div>
      </form>

      {loading && <Loader />}

      <div className="gallery grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {images.map((image) => (
          <div
            key={image.id}
            className="border-2 border-black rounded-lg bg-white overflow-hidden flex flex-col"
          >
            <a
              href={image.largeImageURL}
              data-caption={image.tags}
              className="block flex-grow"
            >
              <img
                src={image.webformatURL}
                alt={image.tags}
                className="w-full h-full object-cover"
              />
            </a>
            <div className="grid grid-cols-4 text-center text-xs py-3 mt-auto">
              <div>
                <div className="font-bold">Likes</div>
                <div>{image.likes}</div>
              </div>
              <div>
                <div className="font-bold">Views</div>
                <div>{image.views}</div>
              </div>
              <div>
                <div className="font-bold">Comments</div>
                <div>{image.comments}</div>
              </div>
              <div>
                <div className="font-bold">Downloads</div>
                <div>{image.downloads}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImageGallery;
