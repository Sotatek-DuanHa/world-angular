import { Routes } from '@angular/router';

export const routes: Routes = [
        {
          path: '',
          loadComponent: () => import('./home/home.component'),
        },
        {
          path: 'posts',
          loadComponent: () => import('./post/post.component'),
        },
        {
          path: 'posts/new',
          loadComponent: () => import('./post/post-new.component'),
        },
        {
          path: 'posts/:postId',
          loadComponent: () => import('./post/post-postId.component'),
        },
];
