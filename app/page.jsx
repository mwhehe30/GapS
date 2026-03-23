import NavBar from '@/components/NavBar';
import Link from 'next/link';
import Image from 'next/image';
import {
  ChartNoAxesCombined,
  LayoutDashboard,
  Map,
  Target,
  ChartColumnIncreasing,
  MessageCircleQuestionMark,
  ArrowRight,
  Linkedin,
  Twitter,
  Instagram,
} from 'lucide-react';
import { UserCircle, BookMarked } from 'lucide-react';

const steps = [
  {
    num: '01',
    icon: <UserCircle />,
    title: 'Isi profil kariermu',
    desc: 'Masukkan posisi saat ini, pengalaman, dan skill yang sudah kamu kuasai. Prosesnya cepat, tidak lebih dari 5 menit.',
  },
  {
    num: '02',
    icon: <Target />,
    title: 'Pilih posisi target',
    desc: 'Tentukan posisi yang ingin kamu raih. GapS akan menganalisis ratusan job description aktual untuk posisi tersebut.',
  },
  {
    num: '03',
    icon: <ChartColumnIncreasing />,
    title: 'Lihat gap skill kamu',
    desc: 'Dapatkan laporan detail: skill apa yang sudah kamu punya, mana yang kurang, dan seberapa besar gap-nya.',
  },
  {
    num: '04',
    icon: <Map />,
    title: 'Ikuti roadmap belajar',
    desc: 'Mulai belajar dengan panduan terstruktur dan resource gratis yang sudah dikurasi khusus untuk gap skill kamu.',
  },
];

const features = [
  {
    icon: <ChartNoAxesCombined />,
    title: 'Skill Analisis',
    description:
      'Mengetahui kemampuan kamu saat ini secara lebih jelas dan terukur.',
  },
  {
    icon: <LayoutDashboard />,
    title: 'Dashboard',
    description:
      'Pantau progress belajar kamu dalam satu tampilan yang ringkas.',
  },
  {
    icon: <Map />,
    title: 'Roadmap',
    description:
      'Ikuti jalur belajar terstruktur yang disesuaikan dengan target role kamu.',
  },
];

const questions = [
  {
    question: 'Apa itu GapS?',
    answer:
      'GapS adalah platform yang membantu kamu memahami kekurangan skill dan membandingkannya dengan kebutuhan untuk mencapai posisi impian.',
  },
  {
    question: 'Apakah GapS cocok untuk pemula?',
    answer:
      'Ya, GapS dirancang agar mudah digunakan oleh siapa saja, termasuk yang baru mulai belajar skill baru.',
  },
  {
    question: 'Apakah saya harus tahu semua skill dari awal?',
    answer:
      'Tidak. Kamu bisa mulai dari skill yang kamu ketahui, lalu menyesuaikannya seiring proses belajar.',
  },
  {
    question: 'Bagaimana cara kerja GapS?',
    answer:
      'Kamu cukup memasukkan skill yang dimiliki, menentukan tujuan, lalu GapS akan menunjukkan skill yang masih perlu ditingkatkan.',
  },
  {
    question: 'Apakah saya bisa melacak perkembangan skill saya?',
    answer:
      'Bisa. GapS menyediakan fitur tracking untuk melihat perkembangan skill kamu dari waktu ke waktu.',
  },
];

const page = () => {
  return (
    <main className='bg-gray-200'>
      <NavBar />

      <section className='bg-gray-200'>
        <div className='container mx-auto py-12 md:py-16 2xl:py-24 px-4 grid grid-cols-1 md:grid-cols-2 gap-10 items-center'>
          <div className='flex flex-col gap-8'>
            <h1 className='text-4xl sm:text-5xl 2xl:text-7xl font-semibold leading-tight'>
              Tutupi Kekurangan untuk Posisi Impian
            </h1>
            <p className='text-gray-900/70 max-w-lg text-sm sm:text-base'>
              GapS menganalisis profil kariermu dan membandingkannya dengan
              kebutuhan pasar kerja aktual. Dapatkan identifikasi gap skill yang
              spesifik, roadmap belajar terstruktur, dan rekomendasi resource
              gratis.
            </p>
            <div className='flex flex-wrap gap-4'>
              <Link
                href='/analysis'
                className='bg-gray-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors'
              >
                Analisis Skill Saya
              </Link>
              <Link
                href='#how-it-works'
                className='text-gray-900 px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors'
              >
                Cara Kerja
              </Link>
            </div>
          </div>

          <div></div>
        </div>
      </section>

      {/* Features */}
      <section
        className='py-16 md:py-20'
        id='features'
        style={{
          background: 'linear-gradient(to bottom, #e9ecef 50%, #f8f9fa 50%)',
        }}
      >
        <div className='container mx-auto px-4 shadow-lg bg-gray-100 rounded-xl px-6 md:px-16 lg:px-24 py-10 md:py-12 flex flex-col gap-10'>
          <div className='flex flex-col gap-5'>
            <span className='text-sm text-gray-500 font-medium'>Features</span>
            <div className='grid grid-cols-1 md:grid-cols-5 gap-6'>
              <div className='md:col-span-3'>
                <h2 className='text-2xl sm:text-3xl 2xl:text-5xl font-semibold'>
                  Fitur yang Membantu Kamu Berkembang
                </h2>
              </div>
              <div className='md:col-span-2'>
                <p className='text-gray-900/70 text-sm sm:text-base'>
                  Pahami dan tingkatkan skill kamu dengan lebih terarah. Fokus
                  pada hal penting untuk posisi impian.
                </p>
              </div>
            </div>
          </div>
          <div className='grid grid-cols-1 sm:grid-cols-3 gap-6'>
            {features.map((feature, index) => (
              <div key={index} className='p-4 flex flex-col gap-3'>
                <div className='text-gray-700'>{feature.icon}</div>
                <h3 className='text-lg font-semibold'>{feature.title}</h3>
                <p className='text-sm text-gray-900/70'>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className='bg-gray-100' id='how-it-works'>
        <div className='container mx-auto px-4 py-16 md:py-24'>
          <div className='text-center mb-12 md:mb-16 flex flex-col items-center gap-4'>
            <span className='text-sm text-gray-500 font-medium'>
              How It Works
            </span>
            <h2 className='text-3xl sm:text-4xl 2xl:text-5xl font-bold text-gray-900'>
              Bagaimana GapS Membantu Kamu
            </h2>
          </div>
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8'>
            {steps.map((step) => (
              <div key={step.num} className='flex flex-col gap-4'>
                <div className='size-12 2xl:size-16 rounded-2xl bg-gray-500 flex items-center justify-center text-white flex-shrink-0'>
                  {step.icon}
                </div>
                <p className='text-gray-500 text-xs font-bold'>{step.num}</p>
                <h3 className='text-gray-900 font-semibold text-lg'>
                  {step.title}
                </h3>
                <p className='text-gray-900/70 text-sm leading-relaxed'>
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className='bg-gray-100'>
        <div id='faq' className='container mx-auto px-4 py-16'>
          <div className='flex flex-col gap-4 mb-12'>
            <span className='text-sm text-gray-500 font-medium'>FAQs</span>
            <h2 className='text-3xl sm:text-4xl font-bold'>
              Masih Punya Pertanyaan?
            </h2>
          </div>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8'>
            {questions.map((question, i) => (
              <div key={i} className='grid grid-cols-[auto_1fr] gap-4'>
                <div className='w-12 h-12 md:w-14 md:h-14 rounded-xl border-2 border-gray-400 flex items-center justify-center text-gray-500 flex-shrink-0'>
                  <MessageCircleQuestionMark className='w-5 h-5' />
                </div>
                <div className='flex flex-col gap-2'>
                  <h3 className='font-bold text-lg md:text-xl'>
                    {question.question}
                  </h3>
                  <p className='text-sm text-gray-900/70'>{question.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className='bg-gray-100 px-4'>
        <div
          id='cta'
          className='container mx-auto bg-gray-600 rounded-xl overflow-hidden relative'
        >
          <div className='text-gray-100 flex flex-col gap-5 py-10 px-8 md:px-12 max-w-xl'>
            <h2 className='text-2xl sm:text-3xl 2xl:text-4xl font-bold'>
              Siap Berkembang ke Level Berikutnya?
            </h2>
            <p className='text-sm text-gray-300'>
              Dapatkan rekomendasi skill dan roadmap belajar yang sesuai dengan
              minat dan tujuan karier kamu.
            </p>
            <div className='flex flex-wrap gap-4'>
              <Link
                href='/analysis'
                className='px-5 py-2.5 bg-white text-gray-900 rounded-lg text-sm font-bold hover:bg-gray-100 transition-colors'
              >
                Get Started
              </Link>
              <Link
                href='#how-it-works'
                className='px-5 py-2.5 border border-gray-400 text-gray-100 rounded-lg text-sm font-medium hover:border-gray-200 transition-colors'
              >
                Learn More
              </Link>
            </div>
          </div>
          <div className='absolute right-0 top-0 h-full hidden md:block pointer-events-none'>
            <Image
              src='/decor.svg'
              alt='decor'
              width={400}
              height={400}
              className='h-full w-auto object-cover'
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className='bg-gray-100 pt-16'>
        <section className='container mx-auto px-4 pt-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8'>
          <div className='flex flex-col gap-5 sm:col-span-2 md:col-span-1'>
            <h3 className='text-2xl font-bold text-gray-900/70'>
              Gap<span className='text-gray-900'>S</span>
            </h3>
            <p className='text-gray-900/70 text-sm'>
              GapS adalah platform yang membantu kamu mengidentifikasi
              kekurangan skill dan merancang roadmap belajar yang tepat untuk
              karier impianmu.
            </p>
            <div className='flex gap-4 text-gray-900/70'>
              <Link href='/'>
                <Linkedin className='w-5 h-5' />
              </Link>
              <Link href='/'>
                <Twitter className='w-5 h-5' />
              </Link>
              <Link href='/'>
                <Instagram className='w-5 h-5' />
              </Link>
            </div>
          </div>
          <div className='flex flex-col gap-4'>
            <h4 className='text-base font-bold'>Platform</h4>
            <div className='flex flex-col gap-2 text-sm text-gray-900/70'>
              <Link href='/'>Home</Link>
              <Link href='/analysis'>Skill Analysis</Link>
              <Link href='/roadmap'>Roadmap</Link>
              <Link href='/dashboard'>Dashboard</Link>
            </div>
          </div>
          <div className='flex flex-col gap-4'>
            <h4 className='text-base font-bold'>Bantuan</h4>
            <div className='flex flex-col gap-2 text-sm text-gray-900/70'>
              <Link href='/'>Hubungi Kami</Link>
              <Link href='/'>Syarat & Ketentuan</Link>
            </div>
          </div>
          <div className='flex flex-col gap-4'>
            <h4 className='text-base font-bold'>Update Info</h4>
            <p className='text-sm text-gray-900/70'>
              Jadilah yang pertama tahu tentang update terbaru dari GapS.
            </p>
            <form className='flex items-center bg-gray-200 rounded-full px-3 py-2 gap-2'>
              <span className='text-lg -translate-y-0.5'>@</span>
              <input
                type='email'
                placeholder='Masukan Email Kamu...'
                className='flex-1 bg-transparent outline-none text-sm min-w-0'
              />
              <button className='size-8 rounded-full bg-gray-900/70 grid place-items-center text-white cursor-pointer flex-shrink-0'>
                <ArrowRight className='w-4 h-4' />
              </button>
            </form>
          </div>
        </section>
        <section className='container mx-auto px-4 pb-10 mt-8 border-t border-gray-200 pt-6'>
          <p className='text-sm text-gray-500'>
            © 2026 GapS. All rights reserved.
          </p>
        </section>
      </footer>
    </main>
  );
};

export default page;
