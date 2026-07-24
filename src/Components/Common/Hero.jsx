const Hero = () => {
  return (
    <section className="relative min-h-screen bg-[#080815] overflow-hidden flex items-center">

      {/* Background Blur */}
      <div className="absolute w-96 h-96 bg-violet-600 rounded-full blur-[180px] opacity-30 top-20 -left-24"></div>

      <div className="absolute w-96 h-96 bg-cyan-500 rounded-full blur-[180px] opacity-20 bottom-10 right-0"></div>

      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-14 items-center">

        {/* Left */}

        <div>

          <p className="inline-block bg-violet-500/20 text-violet-300 px-4 py-2 rounded-full mb-6">
            🚀 Influencer Marketing Made Easy
          </p>

          <h1 className="text-5xl lg:text-7xl font-black leading-tight text-white">

            Find the

            <span className="text-violet-500">
              {" "}
              Perfect Creator
            </span>

            <br />

            For Your Brand.

          </h1>

          <p className="text-gray-400 mt-8 text-lg leading-8 max-w-xl">

            Discover talented creators, launch campaigns,
            collaborate effortlessly, and grow your brand faster
            than ever.

          </p>

          <div className="flex gap-5 mt-10">

            <button className="bg-violet-600 hover:bg-violet-700 px-8 py-4 rounded-full text-white font-semibold transition">
              Explore Creators
            </button>

            <button className="border border-gray-600 hover:border-violet-500 hover:text-violet-400 px-8 py-4 rounded-full text-white transition">
              Become Creator
            </button>

          </div>

        </div>

        {/* Right */}

        <div className="relative">

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">

            <img
              src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=700"
              alt=""
              className="rounded-2xl h-105 w-full object-cover"
            />

            <div className="mt-6 flex justify-between">

              <div>
                <h2 className="text-white text-xl font-bold">
                  Emily Carter
                </h2>

                <p className="text-gray-400">
                  Lifestyle Creator
                </p>
              </div>

              <div className="text-right">

                <h2 className="text-violet-400 font-bold">
                  240K
                </h2>

                <p className="text-gray-400">
                  Followers
                </p>

              </div>

            </div>

          </div>

        </div>

      </div>

    </section>
  );
};

export default Hero;