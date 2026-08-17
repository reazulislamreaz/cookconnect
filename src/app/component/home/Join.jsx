

export default function Join() {
  return (
    <section className="bg-orange-500 py-16 md:py-24 text-white text-center px-4 font-poppins">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4">Ready To Join The CookKonnect Community?</h2>
        <p className="text-base md:text-lg mb-8 max-w-2xl mx-auto">
          Whether You Are A Chef Looking For Opportunities Or A Restaurant Seeking Talent, Get Started Today.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button
       
            className="border-white text-white hover:bg-white hover:text-orange-500 border  px-8 py-1 text-lg rounded-lg bg-transparent"
          >
            Register for free
          </button>
          <button className="bg-white text-orange-500 hover:bg-gray-100 px-8 py-1 text-lg rounded-lg">Log in</button>
        </div>
      </div>
    </section>
  )
}
