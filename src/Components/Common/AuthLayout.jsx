import BrandForm from "../Auth/BrandForm";
import CreatorForm from "../Auth/CreatorForm";


const AuthLayout = ({ role, setRole }) => {
  return (
    <div className="min-h-screen bg-[#080815] flex items-center justify-center px-6 py-10">

      <div className="w-full max-w-6xl grid lg:grid-cols-2 overflow-hidden rounded-3xl shadow-2xl">

        {/* ================= LEFT PANEL ================= */}

        <div className="relative bg-linear-to-br from-violet-700 via-indigo-700 to-cyan-600 p-12 flex flex-col justify-between">

          {/* Decorative Blur */}
          <div className="absolute w-72 h-72 bg-pink-500 opacity-20 rounded-full blur-[120px] top-10 -left-20"></div>

          <div className="absolute w-72 h-72 bg-cyan-300 opacity-20 rounded-full blur-[120px] bottom-0 right-0"></div>

          <div className="relative z-10">

            <h1 className="text-5xl font-black text-white tracking-wide">
              BrandVerse
            </h1>

            <h2 className="text-4xl font-bold text-white mt-12 leading-snug">
              Create.
              <br />
              Connect.
              <br />
              Collaborate.
            </h2>

            <p className="text-white/80 mt-8 leading-8 text-lg max-w-md">
              Join thousands of brands and creators building
              meaningful partnerships and growing together.
            </p>

          </div>

          <div className="relative z-10">

            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">

              <h3 className="text-white text-xl font-semibold">
                🚀 Start Your Journey
              </h3>

              <p className="text-white/70 mt-3">
                Build collaborations, manage campaigns and
                connect with creators from around the world.
              </p>

            </div>

          </div>

        </div>

        {/* ================= RIGHT PANEL ================= */}

        <div className="bg-[#111124] p-10 lg:p-14">

          <h2 className="text-4xl font-bold text-white">
            Create Account
          </h2>

          <p className="text-gray-400 mt-2">
            Choose how you'd like to use BrandVerse.
          </p>

          {/* Toggle */}

          <div className="mt-8 bg-[#1B1B33] rounded-full p-1 flex">

            <button
              onClick={() => setRole("brand")}
              className={`flex-1 py-3 rounded-full font-semibold transition-all duration-300 ${
                role === "brand"
                  ? "bg-violet-600 text-white shadow-lg"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              I'm a Brand
            </button>

            <button
              onClick={() => setRole("creator")}
              className={`flex-1 py-3 rounded-full font-semibold transition-all duration-300 ${
                role === "creator"
                  ? "bg-violet-600 text-white shadow-lg"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              I'm a Creator
            </button>

          </div>

          {/* Sliding Form */}

          <div className="mt-10 transition-all duration-500">

            {role === "brand" ? 

                <BrandForm /> : <CreatorForm />
            }

          </div>

        </div>

      </div>

    </div>
  );
};

export default AuthLayout;