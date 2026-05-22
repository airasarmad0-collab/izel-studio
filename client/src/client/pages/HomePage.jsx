import React from "react";
import ClientNavbar from "../components/ClientNavbar";
import HomeHero from "../components/HomeHero";
import LatestClothes from "../components/LatestClothes";
import CustomersFavourites from "../components/CustomersFavourites";
import HomeBanner from "../components/HomeBanner";
import Testimonials from "../components/Testimonials";
import { Helmet } from "react-helmet-async";
import HomeBannerTwo from "../components/HomeBannerTwo";
import Footer from "../components/Footer";
const HomePage = () => {
  return (
    <>
      <Helmet>
        <title>Izel Studio - Home page</title>
        <meta
          name="description"
          content="Izel Studio - Discover premium luxury clothing, latest fashion drops, and exclusive collections designed for modern elegance."
        />
      </Helmet>
      <ClientNavbar />
      <HomeHero />
      <LatestClothes />
      <CustomersFavourites />
      <HomeBanner />
      <Testimonials />
      <HomeBannerTwo/>
      <Footer />
    </>
  );
};

export default HomePage;
