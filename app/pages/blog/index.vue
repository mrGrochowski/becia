<script setup lang="ts">
import { useAsyncData } from '#app'

const { data: posts } = await useAsyncData('blog_posts', () => queryCollection('blog').order('date', 'DESC').all())

useSeoMeta({
  title: 'Blog - Mięciutkie szydełkowanie by Becia',
  description: 'Najnowsze wpisy z bloga o rękodziele i maskotkach.'
})

useSchemaOrg([
  defineBreadcrumb({
    itemListElement: [
      { name: 'Strona Główna', item: '/' },
      { name: 'Blog' }
    ]
  })
])
</script>

<template>
  <main class="min-h-screen bg-[#FDFBF7] dark:bg-slate-900 py-12 px-4">
    <div class="max-w-4xl mx-auto">
      <div class="flex items-center gap-4 mb-8">
        <NuxtLink to="/" class="flex items-center justify-center p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
          <span class="material-symbols-outlined text-leather dark:text-primary">arrow_back</span>
        </NuxtLink>
        <h1 class="text-3xl font-bold text-leather dark:text-primary">Blog</h1>
      </div>

      <div class="grid gap-8">
        <article v-for="post in posts" :key="post.path" class="bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-md border-4 border-white dark:border-slate-700 flex flex-col sm:flex-row">
          <NuxtLink :to="post.path" class="sm:w-1/3 shrink-0 block">
            <NuxtImg v-if="post.image" :src="post.image" :alt="post.alt || post.title" class="w-full h-48 sm:h-full object-cover" loading="lazy" />
          </NuxtLink>
          <div class="p-6 flex-1 flex flex-col justify-center">
            <h2 class="text-2xl font-bold text-leather dark:text-primary mb-2">
              <NuxtLink :to="post.path">{{ post.title }}</NuxtLink>
            </h2>
            <p class="text-slate-500 dark:text-slate-400 mb-4">{{ post.description }}</p>
            <div class="mt-auto">
              <NuxtLink :to="post.path" class="inline-block px-4 py-2 bg-leather text-white rounded-md text-sm font-semibold hover:bg-leather/90 transition-colors">
                Czytaj dalej
              </NuxtLink>
            </div>
          </div>
        </article>
      </div>
    </div>
  </main>
</template>
