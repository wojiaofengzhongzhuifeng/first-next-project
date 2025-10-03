import Head from 'next/head'

export default function Home() {
  return (
    <>
      <Head>
        <title>Hello World</title>
        <meta name="description" content="Hello World Application" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white">
        <div className="container mx-auto px-4 py-16">
          <h1 className="text-6xl font-bold text-center text-blue-600 mb-8">
            Hello World!
          </h1>
          <p className="text-xl text-center text-gray-600 mb-12">
            Welcome to the Hello World application
          </p>
          <div className="text-center">
            <a 
              href="/count-number/about-us" 
              className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Visit About Us Page
            </a>
          </div>
        </div>
      </main>
    </>
  )
}
