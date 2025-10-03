import React from 'react'
import Head from 'next/head'
import Link from 'next/link'

export default function AboutUs() {
  return (
    <>
      <Head>
        <title>About Us - Count Number</title>
        <meta
          name="description"
          content="About us page for Count Number application"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-green-50 to-white">
        <div className="container mx-auto px-4 py-16">
          <h1 className="text-6xl font-bold text-center text-green-600 mb-8">
            About Us
          </h1>
          <div className="max-w-3xl mx-auto">
            <p className="text-xl text-center text-gray-600 mb-8">
              Welcome to the About Us page of the Count Number application. We
              are dedicated to providing the best counting experience for our
              users.
            </p>

            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                Our Mission
              </h2>
              <p className="text-gray-600 mb-6">
                Our mission is to create intuitive and powerful counting tools
                that help people track, manage, and analyze numbers in their
                daily lives and business operations.
              </p>

              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                What We Do
              </h2>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>Provide real-time counting solutions</li>
                <li>Offer data analytics and insights</li>
                <li>Ensure data security and privacy</li>
                <li>Deliver exceptional user experience</li>
              </ul>
            </div>

            <div className="text-center space-x-4">
              <Link
                href="/count-number"
                className="inline-block bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
              >
                Back to Count Number
              </Link>
              <Link
                href="/"
                className="inline-block bg-gray-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
              >
                Home
              </Link>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
