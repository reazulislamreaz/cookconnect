const { default: Image } = require("next/image");
import AboutUsBanner from '../../component/Banner/AboutUsBanner';
import chefImg from '../../../assets/chefImage.png'


const AboutUsPage = () => {
    return (
  <div>
    <AboutUsBanner/>
       <div className="bg-white min-h-screen ">
      <div className="max-w-5xl mx-auto  p-6 sm:p-10 ">
        <div className="w-full flex items-center justify-center mb-8">
          <Image
            src={chefImg}
            alt="Chef Image"
            width={800}
            height={800}
            className="rounded"
          />
        </div>

        <p className="text-gray-700 mb-6">
          There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in
          some form, by injected humour, or randomised words which don&apos;t look even slightly believable. If you are going
          to use a passage of Lorem Ipsum, you need to be sure there isn&apos;t anything embarrassing hidden in the middle of
          text.
        </p>

        <p className="text-gray-700 mb-6">
          All the Lorem Ipsum generators on the Internet tend to repeat predefined chunks as necessary, making this the
          first true generator on the Internet. It uses a dictionary of over 200 Latin words, combined with a handful of
          model sentence structures, to generate Lorem Ipsum which looks reasonable. The generated Lorem Ipsum is
          therefore always free from repetition, injected humour, or non-characteristic words etc.
        </p>

        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          The Standard Chunk of Lorem Ipsum Used Since
        </h2>

        <div className="space-y-4 text-gray-700">
          <p>
            But I must explain to you how all this mistaken idea of denouncing pleasure and praising pain was born and I
            will give you a complete account of the system, and expound the actual teachings of the great explorer of
            the truth, the master-builder of human happiness.
          </p>
          <p>
            No one rejects, dislikes, or avoids pleasure itself, because it is pleasure, but because those who do not
            know how to pursue pleasure rationally encounter consequences that are extremely painful.
          </p>
          <p>
            Nor again is there anyone who loves or pursues or desires to obtain pain of itself, because it is pain, but
            occasionally circumstances occur in which toil and pain can procure him some great pleasure.
          </p>
          <p>
            On the other hand, we denounce with righteous indignation and dislike men who are so beguiled and demoralized
            by the charms of pleasure of the moment, so blinded by desire, that they cannot foresee the pain and trouble
            that are bound to ensue.
          </p>
        </div>
      </div>
    </div>
  </div>
    );
};

export default AboutUsPage;