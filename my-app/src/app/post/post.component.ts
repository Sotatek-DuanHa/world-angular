import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  injectMutation,
  injectQuery,
  injectQueryClient,
} from '@tanstack/angular-query-experimental';
import { fromEvent, lastValueFrom, takeUntil } from 'rxjs';
import { PostService } from './data-access/post.service';

@Component({
  selector: 'app-post',
  standalone: true,
  imports: [RouterLink, FormsModule],
  template: `
    <div style="margin-bottom: 20px">
      <a routerLink="/posts/new">New Post</a>
    </div>
    <input type="text" placeholder="Search..." [(ngModel)]="q" />
    @switch (postsRes.status()) { @case ('pending') {
    <span>Loading...</span>
    } @case ('error') {
    <span>Error: {{ postsRes.error()?.message }}</span>
    }
    <!-- also status === 'success', but "else" logic works, too -->
    @default {
    <ul>
      @for (post of postsRes.data(); track post.id) {
      <div style="display:flex; gap:2px; width: 100%; padding: 3px;">
        <a routerLink="/posts/{{ post.id }}">{{ post.title }}</a>
        <button style="margin-left: 10px;" (click)="handleDeletePost(post.id)">
          Delete
        </button>
        <button style="margin-left: 10px;" (click)="handleEditPost(post.id)">
          Edit
        </button>
      </div>
      } @empty {
      <li>No todos found</li>
      }
    </ul>
    } }
  `,
})

export default class PostComponent {
  q = signal('');
  #queryClient = injectQueryClient();
  #postService = inject(PostService);

  constructor(private router: Router) {}

  postsRes = injectQuery(() => ({
    queryKey: ['PostService', 'getPosts', this.q()],
    queryFn: (context) => {
      const abort$ = fromEvent(context.signal, 'abort');
      return lastValueFrom(
        this.#postService.getPosts({ q: this.q() }).pipe(takeUntil(abort$))
      );
    },
  }));

  deletePostMutation = injectMutation((client) => ({
    mutationFn: (id: number) =>
      lastValueFrom(this.#postService.deletePost(String(id))),
      onMutate:async ()=> {
          
      }
  }));

  handleDeletePost(id: number) {
    this.deletePostMutation.mutate(id, {
      onSuccess: () => {
        return this.#queryClient.invalidateQueries({
          queryKey: ['PostService'],
        });
      },
    });
  }

  handleEditPost(id: number) {
    this.router.navigate(['/posts/new'], { queryParams: { id } });
  }
}
