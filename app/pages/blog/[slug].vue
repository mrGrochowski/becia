<script setup lang="ts">
import { useAsyncData } from '#app'

const route = useRoute()

const { data: post } = await useAsyncData(`blog_post_${route.path}`, () =>
  queryCollection('blog').path(route.path).first()
)

if (!post.value) {
  throw createError({ statusCode: 404, statusMessage: 'Post not found', fatal: true })
}

useSeoMeta({
  title: `${post.value.title} - Mięciutkie szydełkowanie by Becia`,
  description: post.value.description,
  ogTitle: post.value.title,
  ogDescription: post.value.description,
  ogImage: post.value.image
})

useSchemaOrg([
  defineArticle({
    headline: post.value.title,
    description: post.value.description,
    image: post.value.image,
    datePublished: post.value.date,
    dateModified: post.value.date,
  }),
  defineBreadcrumb({
    itemListElement: [
      { name: 'Strona Główna', item: '/' },
      { name: 'Blog', item: '/blog' },
      { name: post.value.title }
    ]
  })
])
</script>

<template>
  <main class="min-h-screen bg-[#FDFBF7] dark:bg-slate-900 py-12 px-4">
    <div class="max-w-3xl mx-auto bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-lg p-6 md:p-10 border-4 border-white dark:border-slate-700">
      <div class="mb-6 flex items-center gap-4">
        <NuxtLink to="/blog" class="flex items-center justify-center p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
          <span class="material-symbols-outlined text-leather dark:text-primary">arrow_back</span>
        </NuxtLink>
        <span class="text-slate-500 dark:text-slate-400 text-sm">Powrót do bloga</span>
      </div>

      <header class="mb-8">
        <h1 class="text-3xl md:text-5xl font-bold text-leather dark:text-primary mb-4">{{ post.title }}</h1>
        <p class="text-slate-500 dark:text-slate-400 text-lg mb-6">{{ post.description }}</p>
        <div v-if="post.image" class="rounded-xl overflow-hidden border-4 border-white dark:border-slate-700 shadow-md">
          <NuxtImg :src="post.image" :alt="post.alt || post.title" class="w-full h-auto object-cover max-h-[500px]" />
        </div>
      </header>

      <div class="prose prose-lg dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 [&_h1]:text-leather dark:[&_h1]:text-primary [&_h2]:text-leather dark:[&_h2]:text-primary [&_a]:text-leather dark:[&_a]:text-primary [&_a]:font-bold hover:[&_a]:underline">
        <ContentRenderer v-if="post" :value="post" />
      </div>
    </div>
  </main>
</template>
