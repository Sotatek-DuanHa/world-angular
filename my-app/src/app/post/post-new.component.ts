import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  injectMutation,
  injectQuery,
  injectQueryClient,
} from '@tanstack/angular-query-experimental';
import { lastValueFrom } from 'rxjs';
import { CreatePost, PostService } from './data-access/post.service';

@Component({
  selector: 'app-post',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule],
  template: `
    <form [formGroup]="postForm" (ngSubmit)="onSubmit()" #form="ngForm">
      <div class="margin-bottom: 20px d-flex gap-2 ">
        <p class="w-25">Title</p>
        <input type="text" formControlName="title" />
        @if ( !postForm.controls.title.valid && (postForm.controls.title.dirty
        || form.submitted) ) {
        <p style="margin:0; font-size: 14px; color: red;">Title is required</p>
        }
      </div>
      <div class="margin-bottom: 20px d-flex gap-2 ">
        <p class="w-25">Content</p>
        <input type="text" formControlName="content" />
      </div>
      <button style="margin-top: 15px;">Save</button>
      <span>{{ status }}</span>
    </form>
  `,
})

export default class PostNewComponent {
  id = '';
  #fb = inject(FormBuilder);
  #postService = inject(PostService);
  #queryClient = injectQueryClient();
  #router = inject(Router);
  status: string = '';

  postQ = injectQuery(() => ({
    enabled: !!this.id,
    queryKey: ['PostService', 'getPostById', this.id],
    queryFn: () =>
      lastValueFrom(this.#postService.getPostById(String(this.id))),
  }));

  postForm = this.#fb.nonNullable.group({
    title: [
      this.postQ.data()?.title || '',
      [Validators.required, Validators.minLength(6)],
    ],
    content: [this.postQ.data()?.content || ''],
  });

  constructor(private router: ActivatedRoute) {
  }

  ngOnInit() {
    this.router.queryParams.subscribe((params) => {
      this.id = params['id'];
    });
    if (!!this.id) {
      this.postQ.refetch().then((data) => {
        if (data) {
          this.postForm.setValue({
            title: data.data?.title || '',
            content: data.data?.content || '',
          });
        }
      });
    } else {
      this.postForm.setValue({
        title: '',
        content: '',
      });
    }
  }

  handlePost = injectMutation(() => ({
    mutationFn: (post: CreatePost) =>
      lastValueFrom(
        this.id
          ? this.#postService.updatePost({
              id: this.id,
              data: post,
            })
          : this.#postService.createPost(post)
      ),
  }));

  onSubmit() {
    if (this.postForm.valid) {
      this.status = !this.id ? 'Adding post...' : "Updated post..."
      this.handlePost.mutate(this.postForm.getRawValue(), {
        onError: () => {
            this.status = `An error occurred: ${
              this.handlePost.error()?.message
            }`;
        },
        onSuccess: async () => {
          this.#queryClient.removeQueries({ queryKey: ['PostService'] });
          this.#router.navigate(['/posts']);
        },
    
      });
    }
  }
}
